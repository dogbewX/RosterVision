require('dotenv').config();
const ragService = require('./services/ragService');

async function test() {
    try {
        console.log("Testing Indexing...");
        const count = await ragService.buildIndex();
        console.log("Success! Count:", count);
    } catch (e) {
        console.error("FAILED:");
        console.error(e);
    }
}

test();
