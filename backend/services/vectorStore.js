/* vectorStore.js
   Adapter supporting Qdrant (preferred) and Pinecone fallback.
   Qdrant env vars: QDRANT_URL, QDRANT_API_KEY (optional), QDRANT_COLLECTION (base name)
   Pinecone env vars: PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX
*/
const PREFERRED = process.env.PREFERRED_VECTOR_DB || (process.env.QDRANT_URL ? 'qdrant' : (process.env.PINECONE_API_KEY ? 'pinecone' : null));

let qdrantClient = null;
let pineconeClient = null;

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function initQdrant() {
  if (qdrantClient) return qdrantClient;
  const { QdrantClient } = require('@qdrant/js-client-rest');
  const url = process.env.QDRANT_URL; // e.g. http://localhost:6333
  const apiKey = process.env.QDRANT_API_KEY || undefined;
  if (!url) throw new Error('QDRANT_URL not set');
  qdrantClient = new QdrantClient({ url, apiKey });
  return qdrantClient;
}

async function ensureQdrantCollection(collectionName, vectorSize) {
  const client = await initQdrant();
  try {
    const info = await client.collections.get(collectionName);
    return info;
  } catch (e) {
    // create with Cosine distance by default
    await client.collections.create({
      collection_name: collectionName,
      vectors: { size: vectorSize, distance: 'Cosine' }
    });
    return true;
  }
}

async function qdrantUpsertBatch(items = [], namespace) {
  if (!items || !items.length) return;
  const client = await initQdrant();
  const base = process.env.QDRANT_COLLECTION || process.env.PINECONE_INDEX || 'assistant-index';
  const collection = namespace ? `${base}__${namespace}` : base;
  const vectorSize = items[0].values ? items[0].values.length : parseInt(process.env.EMBEDDING_DIM || '1536', 10);
  await ensureQdrantCollection(collection, vectorSize);
  const chunks = chunkArray(items, 200);
  for (const c of chunks) {
    const points = c.map((it) => ({ id: String(it.id), vector: it.values, payload: it.metadata || {} }));
    await client.points.upsert({ collection_name: collection, points });
  }
}

async function qdrantQuery(embedding, topK = 5, namespace) {
  const client = await initQdrant();
  const base = process.env.QDRANT_COLLECTION || process.env.PINECONE_INDEX || 'assistant-index';
  const collection = namespace ? `${base}__${namespace}` : base;
  // If collection missing, return []
  try {
    const res = await client.points.search({ collection_name: collection, vector: embedding, limit: topK, with_payload: true });
    // res is array of { id, score, payload }
    return res.map((r) => ({ id: r.id, score: r.score, metadata: r.payload }));
  } catch (e) {
    console.error('qdrant query error', e.message || e);
    return [];
  }
}

// Pinecone fallback (existing behavior)
async function initPinecone() {
  if (pineconeClient) return pineconeClient;
  const apiKey = process.env.PINECONE_API_KEY;
  const environment = process.env.PINECONE_ENV;
  const indexName = process.env.PINECONE_INDEX || 'assistant-index';
  if (!apiKey || !environment) throw new Error('Pinecone not configured (PINECONE_API_KEY / PINECONE_ENV)');
  const { PineconeClient } = require('@pinecone-database/pinecone');
  pineconeClient = new PineconeClient();
  await pineconeClient.init({ apiKey, environment });
  const idx = pineconeClient.Index(indexName);
  return idx;
}

async function pineconeUpsertBatch(items = [], namespace) {
  if (!items || !items.length) return;
  const idx = await initPinecone();
  const chunks = chunkArray(items, 100);
  for (const c of chunks) {
    const vectors = c.map((it) => ({ id: String(it.id), values: it.values, metadata: it.metadata || {} }));
    await idx.upsert({ upsertRequest: { vectors }, namespace });
  }
}

async function pineconeQuery(embedding, topK = 5, namespace) {
  const idx = await initPinecone();
  const qReq = { vector: embedding, topK, includeMetadata: true, includeValues: false };
  if (namespace) qReq.namespace = namespace;
  const resp = await idx.query({ queryRequest: qReq });
  return resp.matches || resp.results || [];
}

async function upsertBatch(items = [], namespace) {
  if (!items || !items.length) return;
  if (PREFERRED === 'qdrant' || process.env.QDRANT_URL) {
    return qdrantUpsertBatch(items, namespace);
  }
  return pineconeUpsertBatch(items, namespace);
}

async function query(embedding, topK = 5, namespace) {
  if (PREFERRED === 'qdrant' || process.env.QDRANT_URL) {
    return qdrantQuery(embedding, topK, namespace);
  }
  return pineconeQuery(embedding, topK, namespace);
}

module.exports = { upsertBatch, query };
