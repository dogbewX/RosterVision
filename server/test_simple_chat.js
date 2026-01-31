const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

async function test() {
    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            temperature: 0,
            apiKey: process.env.GOOGLE_API_KEY
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["human", "{input}"]
        ]);

        const chain = prompt.pipe(model);

        console.log("Invoking chain with 'Hello'...");
        try {
            const res = await chain.invoke({ input: "Hello" });
            console.log("Response:", res.content);
        } catch (e) {
            console.error("Chain invocation failed:", e);
        }

    } catch (e) {
        console.error("Setup failed:", e);
    }
}

test();
