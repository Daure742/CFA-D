require('dotenv').config();
const mongoose = require('mongoose');
let OpenAI = null;
try { OpenAI = require('openai'); } catch (e) { OpenAI = null; }
const Cours = require('../models/Cours');
const Devoir = require('../models/Devoir');
const Document = require('../models/Document');
const AssistantIndex = require('../models/AssistantIndex');
let vectorStore = null;
try { vectorStore = require('../services/vectorStore'); } catch (e) { /* optional */ }

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI (Atlas) is required to run indexContent.js');
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGO_DBNAME || undefined });
}

async function upsertIndex(client, sourceType, doc) {
  const fullText = (doc.titre ? doc.titre + '\n' : '') + (doc.description ? doc.description + '\n' : '') + (doc.contenu || doc.consignes || '');
  if (!fullText || fullText.trim().length === 0) return [];

  // chunk text into passages (chars-based, with overlap)
  const chunkSize = parseInt(process.env.ASSISTANT_CHUNK_SIZE || '1000', 10);
  const chunkOverlap = parseInt(process.env.ASSISTANT_CHUNK_OVERLAP || '200', 10);
  function splitTextIntoChunks(text, size, overlap) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      const chunk = text.slice(start, end).trim();
      if (chunk.length) chunks.push(chunk);
      if (end === text.length) break;
      start = Math.max(0, end - overlap);
    }
    return chunks;
  }

  const chunks = splitTextIntoChunks(fullText, chunkSize, chunkOverlap);
  if (!chunks.length) return [];

  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large';
  let results = [];
  if (process.env.MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY) {
    // create deterministic mock embeddings
    const { textToDeterministicVector } = require('../services/mockEmbedding');
    results = chunks.map((c) => ({ embedding: textToDeterministicVector(c) }));
  } else {
    // batch embed chunks in one call
    const resp = await client.embeddings.create({ model: embeddingModel, input: chunks });
    results = resp.data || [];
  }

  const items = [];
  for (let i = 0; i < chunks.length; i++) {
    const emb = results[i] && results[i].embedding ? results[i].embedding : null;
    const chunkText = chunks[i];
    // upsert each chunk to Mongo (pass chunkIndex)
    try {
      await AssistantIndex.findOneAndUpdate(
        { tenantId: doc.tenantId, sourceType, sourceId: doc._id, chunkIndex: i },
        { tenantId: doc.tenantId, sourceType, sourceId: doc._id, chunkIndex: i, text: chunkText, embedding: emb || [], createdAt: new Date() },
        { upsert: true }
      );
    } catch (e) {
      console.error('mongo upsert chunk failed', e.message || e);
    }

    const id = `${sourceType}-${doc._id}-chunk-${i}`;
    const metadata = { tenantId: String(doc.tenantId || ''), sourceType, sourceId: String(doc._id), chunkIndex: i, text: chunkText.slice(0, 2000) };
    items.push({ id, values: emb || [], metadata });
  }

  return items;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing');
    process.exit(1);
  }
  await connectDB();
  const client = (OpenAI && process.env.OPENAI_API_KEY) ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

  console.log('Indexing cours...');
  const coursList = await Cours.find({}).lean();
  const itemsByTenant = {};
  for (const c of coursList) {
    try {
      const its = await upsertIndex(client, 'cours', c);
      for (const it of (its || [])) {
        const tk = String(it.metadata.tenantId || '');
        itemsByTenant[tk] = itemsByTenant[tk] || [];
        itemsByTenant[tk].push(it);
      }
    } catch (e) { console.error('cours', c._id, e.message); }
  }

  console.log('Indexing devoirs...');
  const devoirs = await Devoir.find({}).lean();
  for (const d of devoirs) {
    try {
      const its = await upsertIndex(client, 'devoir', d);
      for (const it of (its || [])) {
        const tk = String(it.metadata.tenantId || '');
        itemsByTenant[tk] = itemsByTenant[tk] || [];
        itemsByTenant[tk].push(it);
      }
    } catch (e) { console.error('devoir', d._id, e.message); }
  }

  console.log('Indexing documents...');
  const docs = await Document.find({}).lean();
  for (const doc of docs) {
    try {
      const its = await upsertIndex(client, 'document', doc);
      for (const it of (its || [])) {
        const tk = String(it.metadata.tenantId || '');
        itemsByTenant[tk] = itemsByTenant[tk] || [];
        itemsByTenant[tk].push(it);
      }
    } catch (e) { console.error('document', doc._id, e.message); }
  }

  // perform batch upserts to vector DB per tenant
  if (vectorStore && process.env.PINECONE_API_KEY) {
    for (const tk of Object.keys(itemsByTenant)) {
      const batch = itemsByTenant[tk];
      try {
        console.log('Upserting batch for tenant', tk, 'items', batch.length);
        await vectorStore.upsertBatch(batch, tk);
      } catch (e) {
        console.error('batch upsert failed for tenant', tk, e.message || e);
      }
    }
  }

  console.log('Indexing completed');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(2); });
