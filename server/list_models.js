require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    console.log("Checking available models for API Key...");
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API Key found in .env");
        return;
    }

    // Manual fetch because SDK list_models might be hidden or different version
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Details:", text);
            return;
        }
        const data = await response.json();
        console.log("\nAvailable Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`); // e.g. models/gemini-pro
                }
            });
        } else {
            console.log("No models returned.");
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

listModels();
