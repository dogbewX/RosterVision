const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function checkInjuries() {
    try {
        console.log('Checking injury_status distribution...');
        const res = await pool.query(`
            SELECT injury_status, COUNT(*) 
            FROM player_weekly_stats_view 
            WHERE season_year = 2025 AND week_num = 15 
            GROUP BY injury_status
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkInjuries();
