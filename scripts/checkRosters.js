

const { Pool } = require('pg');
const config = require('../server/config');

const pool = new Pool(config.db);

async function checkRosters() {
    try {
        console.log("Checking latest rosters...");

        // Get the most recent roster
        const rRes = await pool.query(`
            SELECT r.id, r.name, r.created_at, u.username 
            FROM rosters r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC 
            LIMIT 1
        `);

        if (rRes.rows.length === 0) {
            console.log("No rosters found in database.");
            return;
        }

        const roster = rRes.rows[0];
        console.log(`\nLatest Roster: "${roster.name}" by ${roster.username} (ID: ${roster.id})`);
        console.log(`Created: ${roster.created_at}`);

        // Get entries for this roster
        const eRes = await pool.query(`
            SELECT re.slot_type, p.first_name, p.last_name, p.position
            FROM roster_entries re
            JOIN players p ON re.player_id = p.id
            WHERE re.roster_id = $1
        `, [roster.id]);

        console.log("\nEntries:");
        if (eRes.rows.length === 0) {
            console.log(" - This roster has no entries (Active Bug?)");
        } else {
            eRes.rows.forEach(row => {
                console.log(` - [${row.slot_type || 'NULL'}] ${row.first_name} ${row.last_name} (${row.position})`);
            });
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

checkRosters();
