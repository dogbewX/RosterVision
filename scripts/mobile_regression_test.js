const fs = require('fs');
// Emulate the Mobile App Config
// We know it points to Render, but let's verify connectivity directly
const API_BASE_URL = 'https://fd-dashboard-web.onrender.com/api';

async function runMobileRegression() {
    console.log("Starting Mobile App Regression Test (API Layer)...");
    console.log(`Target: ${API_BASE_URL}`);

    // Helper for fetch wrapper
    const post = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const txt = await res.text();
            // Construct an error object similar to axios for catch block
            const err = new Error(`Request failed with status ${res.status}`);
            err.response = { data: txt }; // Mock axios structure
            throw err;
        }
        return { data: await res.json() };
    };

    const get = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            const txt = await res.text();
            const err = new Error(`Request failed with status ${res.status}`);
            err.response = { data: txt };
            throw err;
        }
        return { data: await res.json(), status: res.status };
    };

    const testUser = {
        username: 'RenderTestUser12345',
        password: 'password123'
    };

    try {
        // 1. Test Login (Critical for Mobile)
        console.log("\n1. Testing Login...");
        let user;
        try {
            const res = await post(`${API_BASE_URL}/auth/login`, testUser);
            user = res.data.user;
            console.log("   [PASS] Login Successful:", user.username);
        } catch (e) {
            console.log("   [INFO] Login failed (User might not exist). Attempting Register...");
            // Fallback: Register
            try {
                const regRes = await post(`${API_BASE_URL}/auth/register`, {
                    ...testUser,
                    email: `mobileReg${Date.now()}@test.com`
                });
                user = regRes.data.user;
                console.log("   [PASS] Registration Successful:", user.username);
            } catch (regErr) {
                console.error("   [FAIL] Register Failed:", regErr.message);
                if (regErr.response) console.error("Details:", regErr.response.data);
                return;
            }
        }

        // 2. Test Player Fetch (Mobile Home Screen)
        console.log("\n2. Testing Player Data Fetch...");
        // Mobile calls without params (implies default year/latest week)
        // Mobile now calls with specific params
        const playersRes = await get(`${API_BASE_URL}/players?year=2025&week=16`);
        const players = playersRes.data.data || playersRes.data; // Handle {meta, data} or []

        if (players && players.length > 0) {
            console.log(`   [PASS] Fetched ${players.length} players.`);
        } else {
            console.error("   [FAIL] No players returned. Cannot proceed with Roster Test.");
            return;
        }

        // 3. Test Roster Save (Simulating Mobile App Logic)...
        console.log("\n3. Testing Roster Save (Simulating Mobile App Logic)...");

        // Helper to find player by pos
        const find = (pos, skipIds = []) => players.find(p => p.Position === pos && !skipIds.includes(p.Id));

        const rosterEntries = [];
        const usedIds = [];

        // Target: 1 QB, 2 RB, 2 WR, 1 TE, 1 DEF, 1 FLEX (RB)
        const slots = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'D', 'RB']; // Last RB is Flex

        for (let i = 0; i < slots.length; i++) {
            const pos = slots[i];
            const p = find(pos, usedIds);
            if (p) {
                usedIds.push(p.Id);
                rosterEntries.push({
                    playerId: p.Id,
                    slotType: (i === 7) ? 'FLEX' : pos // Last one is Flex
                });
            } else {
                console.warn(`   [WARN] Could not find player for slot ${pos}`);
            }
        }

        if (rosterEntries.length === 8) {
            const rosterPayload = {
                userId: user.id,
                entries: rosterEntries,
                name: "Regression Test Roster " + new Date().toISOString()
            };

            try {
                const saveRes = await post(`${API_BASE_URL}/rosters`, rosterPayload);
                console.log("   [PASS] Roster Saved. ID:", saveRes.data.id);
            } catch (saveErr) {
                console.error("   [FAIL] Roster Save Failed:", saveErr.message);
                if (saveErr.response) console.error(saveErr.response.data);
            }
        } else {
            console.log("   [SKIP] Not enough players to form full roster.");
        }

        // 4. Test Roster Fetch (Mobile checks Latest)
        console.log("\n4. Testing Roster Fetch (Latest)...");
        const rostersRes = await get(`${API_BASE_URL}/rosters/latest/${user.id}`);
        const fetchedRoster = rostersRes.data;

        if (Array.isArray(fetchedRoster) && fetchedRoster.length > 0) {
            console.log(`   [PASS] Fetched Latest Roster. Players: ${fetchedRoster.length}`);
            if (fetchedRoster.length === 8) {
                console.log("   [PASS] Roster size matches expected (8).");
            }
        } else {
            console.warn("   [WARN] Roster Fetch returned empty or invalid.", fetchedRoster);
        }

    } catch (err) {
        console.error("\n[CRITICAL FAIL] Regression Test Error:", err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
        }
    }
}

runMobileRegression();
