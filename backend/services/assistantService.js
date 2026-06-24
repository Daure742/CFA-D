let OpenAI = null;
let client = null;
try {
  OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (e) {
  OpenAI = null;
  client = null;
}
const Cours = require('../models/Cours');
const Devoir = require('../models/Devoir');
const Document = require('../models/Document');
const AssistantIndex = require('../models/AssistantIndex');

// `client` may be null if OpenAI SDK isn't installed or API key missing; code handles MOCK_MODE accordingly.

async function buildContext({ tenantId, coursId, devoirId }) {
  const parts = [];
  if (coursId) {
    const cours = await Cours.findOne({ _id: coursId, tenantId }).select('titre description contenu dateDebut dateFin formateur');
    if (cours) parts.push({ type: 'cours', data: cours });
  }
  if (devoirId) {
    const devoir = await Devoir.findOne({ _id: devoirId, tenantId }).select('titre consignes dateRendu fichiers');
    if (devoir) parts.push({ type: 'devoir', data: devoir });
  }
  const docs = await Document.find({ tenantId }).sort('-createdAt').limit(10).select('titre description contenu destinataire');
  if (docs && docs.length) parts.push({ type: 'documents', data: docs });
  return parts;
}

function assembleMessages(query, contextParts) {
  const systemPrompt = `Tu es un assistant pédagogique professionnel, factuel et concis. Tu DOIS répondre uniquement en te basant sur le contexte fourni dans "Contexte disponible". Si les informations fournies ne permettent pas de répondre avec confiance, réponds clairement "Je n'ai pas suffisamment d'informations pour répondre à cette question." et liste quelles informations supplémentaires seraient nécessaires. Toujours respecter la confidentialité et NE PAS INVENTER d'informations ou de sources.`;

  const contextText = contextParts.map((p) => {
    try {
      if (p.type === 'indexed') {
        return `--- DOCUMENT INDEXED (${p.sourceType}) ---\n${p.text.slice(0, 1000)}`;
      }
      return `--- ${p.type.toUpperCase()} ---\n${JSON.stringify(p.data, null, 2)}`;
    } catch (e) {
      return `--- ${p.type.toUpperCase()} --- (erreur formatage)`;
    }
  }).join('\n\n');

  const userPrompt = `Question: ${query}\n\nContexte disponible:\n${contextText}\n\nRéponds de façon claire, structurée et professionnelle. Donne des étapes d'action si nécessaire et précise les sources (cours/devoir/document) utilisées.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

let vectorStore = null;
try { vectorStore = require('./vectorStore'); } catch (e) { vectorStore = null; }

async function getRelevantIndexed(tenantId, queryEmbedding, limit = 5) {
  if (vectorStore) {
    try {
      const ns = tenantId ? String(tenantId) : undefined;
      const matches = await vectorStore.query(queryEmbedding, limit, ns);
      return matches.map((m) => {
        const metadata = m.metadata || m.payload || m.payloads || {};
        return {
          score: m.score || m.cosine || m.score || 0,
          embedding: null,
          text: metadata.text || metadata.chunk || metadata.content || '',
          sourceType: metadata.sourceType || metadata.source_type || metadata.source_type || null,
          sourceId: metadata.sourceId || metadata.source_id || metadata.sourceId || null,
          chunkIndex: metadata.chunkIndex || metadata.chunk_index || metadata.chunkIndex || null,
          tenantId: metadata.tenantId || metadata.tenant_id || null
        };
      });
    } catch (e) {
      console.error('vector query error', e.message || e);
    }
  }
  // fallback to local Mongo similarity
  const candidates = await AssistantIndex.find({ tenantId }).limit(500).lean();
  const scored = candidates.map((c) => ({
    ...c,
    score: c.embedding && c.embedding.length ? cosineSim(queryEmbedding, c.embedding) : 0
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

async function getQueryEmbedding(text) {
  if (process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY) {
    const { textToDeterministicVector } = require('./mockEmbedding');
    return textToDeterministicVector(text);
  }
  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large';
  const resp = await client.embeddings.create({ model, input: text });
  return resp.data && resp.data[0] && resp.data[0].embedding ? resp.data[0].embedding : null;
}

async function queryAssistant({ tenantId, query, coursId, devoirId, maxTokens = 800 }) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set — operating in mock/fallback mode');
  }

  // try embedding-based retrieval first
  let contextParts = [];
  try {
    const qEmb = await getQueryEmbedding(query);
    if (qEmb) {
      const relevant = await getRelevantIndexed(tenantId, qEmb, 5);
      if (relevant && relevant.length) {
        contextParts = relevant.map((r) => ({ type: 'indexed', sourceType: r.sourceType, sourceId: r.sourceId, text: r.text, chunkIndex: r.chunkIndex, score: r.score, tenantId: r.tenantId }));
        // if top relevance is below threshold, refuse to answer
        const threshold = parseFloat(process.env.ASSISTANT_MIN_RELEVANCE || '0.25');
        const topScore = Math.max(...relevant.map((x) => x.score || 0));
        if (!topScore || topScore < threshold) {
          return { answer: `Je n'ai pas suffisamment d'informations pertinentes pour répondre à cette question.`, sources: [], notEnoughContext: true };
        }
      }
    }
  } catch (e) {
    // fallback to basic context on any failure
    console.error('Index retrieval error:', e.message || e);
    contextParts = [];
  }

  if (!contextParts.length) {
    contextParts = await buildContext({ tenantId, coursId, devoirId });
  }

  const messages = assembleMessages(query, contextParts);
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  let answer = '';
  if (process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY) {
    // simple mock response: summarise top contextParts or use a small rule-based fallback
    if (contextParts && contextParts.length) {
      const snippets = contextParts.slice(0, 3).map((p, i) => `(${i + 1}) "${String(p.text || (p.data && (p.data.text || p.data.contenu || p.data.description)) || '').slice(0, 200)}"`);
      answer = `Réponse synthétique basée sur les sources disponibles: ${snippets.join(' / ')}.`;
    } else {
      // rule-based fallback for common pedagogical/general questions when no model is available
      const fb = fallbackAnswer(query);
      if (fb) {
        answer = fb;
      } else {
        answer = `Je n'ai pas suffisamment d'informations pour répondre à cette question.`;
      }
    }
  } else {
    const resp = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2
    });

    answer = resp.choices && resp.choices[0] && resp.choices[0].message && resp.choices[0].message.content
      ? resp.choices[0].message.content
      : (resp.output || JSON.stringify(resp));
  }

  const sources = contextParts.map((p) => {
    const isIndexed = p.type === 'indexed';
    const srcType = p.sourceType || (p.data && p.data.sourceType) || (isIndexed ? 'document' : null);
    const id = p.sourceId || (p.data && p.data._id) || null;
    const chunkIndex = p.chunkIndex != null ? p.chunkIndex : (p.data && p.data.chunkIndex != null ? p.data.chunkIndex : null);
    const score = p.score != null ? p.score : null;
    const snippet = (p.text || (p.data && (p.data.text || p.data.contenu || p.data.description))) ? String((p.text || p.data.text || p.data.contenu || p.data.description)).slice(0, 500) : '';
    const urlPathMap = { cours: `/api/cours/${id}`, devoir: `/api/devoirs/${id}`, document: `/api/documents/${id}` };
    const url = id && srcType ? (urlPathMap[srcType] || null) : null;
    return { sourceType: srcType, sourceId: id, chunkIndex, score, snippet, url };
  });

  return { answer, sources };
}

// Small rule-based fallback answers for common general questions when OpenAI is unavailable.
function fallbackAnswer(text) {
  if (!text) return null;
  const t = String(text).toLowerCase();
  if (t.includes('node') && t.includes('js')) {
    return "Node.js est un environnement d'exécution JavaScript côté serveur basé sur le moteur V8 de Chrome. Il permet d'exécuter du JavaScript en dehors d'un navigateur et est couramment utilisé pour construire des API, des serveurs web et des outils en ligne de commande.";
  }
  if (t.includes('openai')) {
    return "OpenAI est une organisation qui développe des modèles d'IA (comme GPT). Pour utiliser leurs API, il faut une clé API (`OPENAI_API_KEY`) et respecter leurs conditions d'utilisation.";
  }
  if (t.includes('mongodb')) {
    return "MongoDB est une base de données NoSQL orientée documents. Les données sont stockées au format BSON (similaire à JSON) et elle est souvent utilisée avec Mongoose en Node.js.";
  }
  if (t.includes('devoir') || t.includes('comment faire un devoir') || t.includes('aide devoir')) {
    return "Pour un devoir: lis attentivement l'énoncé, identifie les consignes, planifie une structure (introduction, développement, conclusion) et vérifie la forme (orthographe, sources). Demande des précisions si le sujet n'est pas clair.";
  }
  return null;
}

module.exports = { queryAssistant };
