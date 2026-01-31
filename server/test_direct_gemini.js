const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "embedding-001" });

        console.log("Testing embedding-001...");
        try {
            const result = await model.embedContent("Hello world");
            console.log("Embedding success, vector length:", result.embedding.values.length);
        } catch (e) {
            console.log("Embedding failed:", e.message);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
