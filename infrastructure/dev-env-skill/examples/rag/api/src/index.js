const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION = "documents";
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(express.json());

// ─── Embedding ───────────────────────────────────────
async function getEmbedding(text) {
  if (process.env.LLM_PROVIDER === "openai") {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    });
    const data = await res.json();
    return data.data[0].embedding;
  }
  // Ollama
  const res = await fetch(`${process.env.OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.EMBEDDING_MODEL, input: text }),
  });
  const data = await res.json();
  return data.embeddings[0];
}

// ─── LLM Chat ────────────────────────────────────────
async function chat(prompt, context) {
  const systemMsg = `You are a helpful assistant. Answer based on the following context. If the answer is not in the context, say "I don't have enough information."

Context:
${context}`;

  if (process.env.LLM_PROVIDER === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }
  // Ollama
  const res = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await res.json();
  return data.message.content;
}

// ─── Text Chunking ───────────────────────────────────
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
    if (i + size >= text.length) break;
  }
  return chunks;
}

// ─── Init Collection ─────────────────────────────────
async function ensureCollection() {
  const collections = await qdrant.getCollections();
  if (!collections.collections.find((c) => c.name === COLLECTION)) {
    const sampleEmbed = await getEmbedding("test");
    await qdrant.createCollection(COLLECTION, {
      vectors: { size: sampleEmbed.length, distance: "Cosine" },
    });
    console.log(`Collection "${COLLECTION}" created (dim=${sampleEmbed.length})`);
  }
}

// ─── Routes ──────────────────────────────────────────

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Upload document (PDF or text)
app.post("/api/ingest", upload.single("file"), async (req, res) => {
  let text = req.body.text || "";

  if (req.file) {
    if (req.file.mimetype === "application/pdf") {
      const pdf = await pdfParse(req.file.buffer);
      text = pdf.text;
    } else {
      text = req.file.buffer.toString("utf-8");
    }
  }

  if (!text) return res.status(400).json({ error: "No text or file provided" });

  await ensureCollection();
  const chunks = chunkText(text);
  const source = req.file?.originalname || req.body.source || "manual";

  const points = [];
  for (let i = 0; i < chunks.length; i++) {
    const vector = await getEmbedding(chunks[i]);
    points.push({
      id: Date.now() + i,
      vector,
      payload: { text: chunks[i], source, chunk: i },
    });
  }

  await qdrant.upsert(COLLECTION, { points });
  res.json({ ingested: chunks.length, source });
});

// Ask question (RAG)
app.post("/api/ask", async (req, res) => {
  const { question, topK = 5 } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided" });

  await ensureCollection();
  const queryVector = await getEmbedding(question);

  const results = await qdrant.search(COLLECTION, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  const context = results.map((r) => r.payload.text).join("\n\n---\n\n");
  const answer = await chat(question, context);

  res.json({
    answer,
    sources: results.map((r) => ({
      text: r.payload.text.slice(0, 200) + "...",
      source: r.payload.source,
      score: r.score,
    })),
  });
});

// Search (vector similarity only, no LLM)
app.post("/api/search", async (req, res) => {
  const { query, topK = 5 } = req.body;
  if (!query) return res.status(400).json({ error: "No query provided" });

  await ensureCollection();
  const queryVector = await getEmbedding(query);
  const results = await qdrant.search(COLLECTION, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  res.json({
    results: results.map((r) => ({
      text: r.payload.text,
      source: r.payload.source,
      score: r.score,
    })),
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`RAG API on :${port}`));
