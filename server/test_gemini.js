require('dotenv').config();
const ragService = require('./services/ragService');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

async function test() {
    try {
        console.log("Testing Gemini Indexing...");
        // This should trigger buildIndex -> GoogleGenerativeAIEmbeddings
        // SKIPPING buildIndex to test Chat only (avoid 429)
        // const count = await ragService.buildIndex();
        console.log("Key available?", !!process.env.GOOGLE_API_KEY);
        console.log("Vector store saved to disk.");

        console.log("Instantiating Chat Model...");
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: process.env.GOOGLE_API_KEY
        });
        // console.log("Chat Model created.");
        // const res = await model.invoke([["human", "Hello"]]);
        // console.log("Chat Test Response:", res);

        console.log("Testing full RAG Chat...");
        const answer = await ragService.chat("What is the database configuration?");
        console.log("Chat Answer:", answer);

    } catch (e) {
        console.error("FAILED:");
        console.error(e);
    }
}

test();
