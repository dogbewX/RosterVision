# Scaling RAG to Enterprise Codebases
## The Challenge: 10,000 Files / 2 Million Lines of Code

The current Chat Bot implementation uses a lightweight, "Script-based RAG" approach suitable for small-to-medium projects (< 500 files). Applying this same architecture to an enterprise codebase (2M+ lines) would encounter significant bottlenecks.

This document outlines those bottlenecks and the necessary architectural changes for scaling.

---

### 1. Ingestion Speed & Rate Limits
**Current Architecture:**
- Uses the `embedding-001` API on a Free/Pay-as-you-go tier.
- Implements strict throttling (sleep 2s every 10 chunks) to avoid `429 Too Many Requests`.

**The Scale Problem:**
- 2M lines ≈ 100,000 chunks.
- Rate limit math: `100,000 chunks / 10 chunks-per-batch * 2 seconds ≈ 20,000 seconds`.
- **Result:** Indexing would take **~5.5 hours**. This is unacceptable for a CI/CD loop.

**The Solution:**
- **Enterprise API Tier:** Upgrade to Google Cloud Vertex AI or OpenAI Enterprise High-Throughput tiers to process thousands of chunks per minute.
- **Parallelization:** Run indexing workers in parallel (e.g., Lambda/Kubernetes jobs).

### 2. Storage & Memory (RAM vs. Database)
**Current Architecture:**
- Loads the entire HNSW index (`vector_store` file) into Server RAM on startup.
- Uses local filesystem storage.

**The Scale Problem:**
- 100,000 vectors * 768 dimensions ≈ 300MB - 500MB raw data.
- While this fits in RAM, **loading and saving** becomes a blocking operation. Server startup would take minutes.
- If multiple server instances run, they cannot share the index (data drift).

**The Solution:**
- **Vector Database:** Move off local disk to a dedicated Vector DB.
    - **PostgreSQL (`pgvector`):** Good for keeping relational data and vectors together.
    - **Pinecone / Weaviate / Qdrant:** Managed services optimized for billion-scale vectors.
- This allows the server to query data without loading it all into RAM.

### 3. Updates (The "Re-Index" Problem)
**Current Architecture:**
- "Brute Force": Deletes the old index and re-scans the entire project folder on request.

**The Scale Problem:**
- You cannot afford to spend 5 hours re-indexing the whole repo just because one developer changed 5,000 lines.

**The Solution:**
- **Incremental Indexing:**
    1. Hook into `git diff` or CI/CD events.
    2. Identify only the files that changed (`modified` or `added`).
    3. Delete old vectors ONLY for those files from the DB.
    4. Generate and insert new vectors.

### 4. Retrieval Quality ("Lost in the Middle")
**Current Architecture:**
- Retrieves the top 50 matches (`k=50`) purely based on vector similarity.

**The Scale Problem:**
- In a 2M line codebase, there might be 50 different functions named `processData` or `init`.
- Vector search is "fuzzy" and might prioritize semantically similar but irrelevant code (e.g., retrieving a test file instead of the core logic).
- 50 chunks is too much context for the LLM to process effectively if 40 of them are noise.

**The Solution:**
- **Hybrid Search:** Combine Vector Search (Concepts) + Keyword Search (BM25 - Exact Matches).
- **Reranking:**
    1. Retrieve a broad set (e.g., top 500 candidates).
    2. Use a high-precision **Reranker Model** (e.g., Cohere Rerank or Google Semantic Ranker).
    3. The Re-ranker reads the candidates and scores them for relevance, filtering down to the top 20 "Gold" chunks.

---

### Summary Architecture: "Platform RAG"

| Feature | Current (Small Scale) | Enterprise (2M+ Lines) |
| :--- | :--- | :--- |
| **Storage** | Local Disk / RAM | Vector Database (Pinecone/pgvector) |
| **Update Strategy** | Full Re-Index | Incremental (Git-based) |
| **Ingestion** | Sequential w/ Sleep | Parallel Workers |
| **Search** | Vector Similarity (k=50) | Hybrid (Vector + Keyword) + Reranking |
| **Cost** | Minimal / Free Tier | High (DB hosting + Enterprise API) |
