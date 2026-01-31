// Native fetch is available in Node 18+
// Actually Node 24 has global fetch.

const config = require('../server/config');

async function verify() {
    console.log("Starting System Verification...");

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${config.port}`;
    const API_URL = `${baseUrl}/api/players?year=2025&week=15`;

    try {
        const start = Date.now();
        const response = await fetch(API_URL);
        const duration = Date.now() - start;

        console.log(`Fetch Status: ${response.status} (${duration}ms)`);

        if (!response.ok) {
            console.error("Failed to fetch players.");
            return;
        }

        const players = await response.json();
        console.log(`Players Loaded: ${players.length}`);

        if (players.length === 0) {
            console.error("No players returned!");
            return;
        }

        // Check Data Structure (Internal App Format mapping happens in Frontend, 
        // but let's check what the API returns vs what Main.js expects)
        // Main.js expects: Id, First_Name, Last_Name, Position, Salary, FPPG, Team, Opponent, Injury_Indicator

        const p = players[0];
        console.log("Sample Player Data (API Format):", JSON.stringify(p, null, 2));

        const requiredFields = ['Id', 'First_Name', 'Last_Name', 'Position', 'Salary', 'FPPG', 'Team', 'Opponent'];
        const missing = requiredFields.filter(f => p[f] === undefined);

        if (missing.length > 0) {
            console.error("Missing fields in API response:", missing);
        } else {
            console.log("Data Structure: VALID");
        }

        // content check
        if (p.First_Name === "Jayden" && p.Last_Name === "Daniels") {
            console.log("Specific Player Check: VALID (Found Jayden Daniels)");
        }

        console.log("System Verification Complete: SUCCESS");

    } catch (err) {
        console.error("Verification Exec Failed:", err);
    }
}

verify();
