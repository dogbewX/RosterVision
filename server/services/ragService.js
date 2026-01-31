const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HNSWLib } = require("@langchain/community/vectorstores/hnswlib");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { createRetrievalChain } = require("langchain/chains/retrieval");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let vectorStore = null;

// Initialize Vector Store (Load or Create)
const initializeVectorStore = async () => {
    if (vectorStore) return vectorStore;

    const vectorStorePath = path.join(__dirname, "../vector_store");

    try {
        console.log("Loading existing vector store...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "embedding-001", // or text-embedding-004
            taskType: "RETRIEVAL_DOCUMENT",
        });
        vectorStore = await HNSWLib.load(vectorStorePath, embeddings);
        console.log("Vector store loaded.");
    } catch (e) {
        console.log("No existing vector store found. Indexing required.");
        // If load fails, we return null, prompting an indexBuild
    }
    return vectorStore;
};

const buildIndex = async (mode = 'full') => {
    console.log(`Starting code indexing (Gemini)... Mode: ${mode}`);

    const { fs } = require("fs");
    const fsPromises = require("fs").promises;
    const crypto = require("crypto");

    const rootPath = path.join(__dirname, "../../");
    const blockedDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.npm', '.gemini', '.vscode', 'vector_store'];
    const blockedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.mp4', '.mov', '.pdf', '.zip', '.tar', '.gz', '.DS_Store', '.env', '.lock'];

    const cachePath = path.join(__dirname, "../vector_store/embedding_cache.json");
    let embeddingCache = {};

    // Load Cache
    if (mode === 'update') {
        try {
            if (fs.existsSync(cachePath)) {
                const cacheData = await fsPromises.readFile(cachePath, 'utf8');
                embeddingCache = JSON.parse(cacheData);
                console.log(`Loaded embedding cache with ${Object.keys(embeddingCache).length} entries.`);
            }
        } catch (e) {
            console.warn("Could not load cache, starting fresh.", e.message);
        }
    } else {
        console.log("Full Index Request - Clearing Cache.");
        // Try to clean up previous store
        const vectorStorePath = path.join(__dirname, "../vector_store");
        try {
            await fsPromises.rm(vectorStorePath, { recursive: true, force: true });
            await fsPromises.mkdir(vectorStorePath, { recursive: true });
        } catch (e) { }
    }

    const getFiles = async (dir) => {
        const subdirs = await fsPromises.readdir(dir);
        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = path.resolve(dir, subdir);
            if (blockedDirs.includes(subdir)) return [];
            try {
                const stat = await fsPromises.stat(res);
                return stat.isDirectory() ? getFiles(res) : res;
            } catch (e) { return []; }
        }));
        return files.reduce((a, f) => a.concat(f), []);
    };

    const allFiles = await getFiles(rootPath);
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md'];
    const codeFiles = allFiles.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return allowedExtensions.includes(ext) && !blockedExtensions.includes(ext);
    });

    console.log(`Processing ${codeFiles.length} source files.`);
    const docs = [];

    for (const filePath of codeFiles) {
        try {
            const loader = new TextLoader(filePath);
            const fileDocs = await loader.load();
            docs.push(...fileDocs);
        } catch (e) { }
    }

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`Total Chunks to process: ${splitDocs.length}`);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        taskType: "RETRIEVAL_DOCUMENT",
    });

    const pendingDocs = [];
    const pendingIndices = [];
    const vectors = new Array(splitDocs.length);

    // Check Cache
    let cachedCount = 0;
    for (let i = 0; i < splitDocs.length; i++) {
        const doc = splitDocs[i];
        const hash = crypto.createHash('md5').update(doc.pageContent).digest('hex');

        if (embeddingCache[hash]) {
            vectors[i] = embeddingCache[hash];
            cachedCount++;
        } else {
            pendingIndices.push(i);
            pendingDocs.push(doc.pageContent);
        }
    }

    console.log(`Cache Hit: ${cachedCount} chunks. Need to embed: ${pendingDocs.length} chunks.`);

    // Batch Embed Pending
    const BATCH_SIZE = 10;
    const DELAY_MS = 2000;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < pendingDocs.length; i += BATCH_SIZE) {
        const batch = pendingDocs.slice(i, i + BATCH_SIZE);
        try {
            console.log(`Embedding New Batch ${i}...`);
            const batchVectors = await embeddings.embedDocuments(batch);

            // Save to Cache & Vector Array
            batchVectors.forEach((vec, batchIdx) => {
                const globalIdx = pendingIndices[i + batchIdx];
                const docContent = pendingDocs[i + batchIdx];
                const hash = crypto.createHash('md5').update(docContent).digest('hex');

                if (vec.length > 700) {
                    embeddingCache[hash] = vec;
                    vectors[globalIdx] = vec;
                }
            });
        } catch (e) {
            console.error(`Batch Error: ${e.message}`);
        }
        await sleep(DELAY_MS);
    }

    // Filter valid
    const validIndices = [];
    const validVectors = [];
    const validDocs = [];

    for (let i = 0; i < vectors.length; i++) {
        if (vectors[i] && vectors[i].length > 700) {
            validIndices.push(i);
            validVectors.push(vectors[i]);
            validDocs.push(splitDocs[i]);
        }
    }

    // Rebuild Index Structure
    console.log("Rebuilding HNSW Index...");
    vectorStore = new HNSWLib(embeddings, { space: "cosine" });
    await vectorStore.addVectors(validVectors, validDocs);

    // Save Store & Cache
    const vectorStorePath = path.join(__dirname, "../vector_store");
    await vectorStore.save(vectorStorePath);
    await fsPromises.writeFile(cachePath, JSON.stringify(embeddingCache), 'utf8');

    console.log("Index and Cache saved.");
    return validDocs.length;
};

const chat = async (question) => {
    if (!vectorStore) await initializeVectorStore();
    if (!vectorStore) throw new Error("Index not found. Please trigger indexing first.");

    // Manual RAG to bypass LangChain hang/error swallowing
    // retrieving more docs (k=50) to ensure we find specific files like config.js
    const vectorStoreRetriever = vectorStore.asRetriever(50);
    const relevantDocs = await vectorStoreRetriever.invoke(question);

    const context = relevantDocs.map(d => d.pageContent).join("\n\n");



    console.log(`[DEBUG] Retrieved ${relevantDocs.length} documents.`);
    relevantDocs.forEach(d => console.log(` - Source: ${d.metadata.source}`));

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // Using gemini-2.0-flash as confirmed by list_models.js
    const genModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert software engineer analyzing the provided codebase. Answer the user's question based strictly on the context provided. If the answer is not in the context, say so.

Context:
${context}

User Question: ${question}`;

    console.log("[DEBUG] Sending prompt to Google SDK Direct...");
    try {
        const result = await genModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("[DEBUG] SDK Response received.");
        return text;
    } catch (err) {
        console.error("[DEBUG] SDK Error:", err.message);
        throw err;
    }
};

module.exports = { buildIndex, chat };
