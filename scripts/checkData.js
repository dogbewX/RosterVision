const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function checkData() {
    try {
        console.log('Checking weekly_stats for week 15...');
        const res = await pool.query('SELECT COUNT(*) FROM weekly_stats WHERE season_year = 2025 AND week_num = 15');
        console.log(`Weekly Stats Count (Week 15): ${res.rows[0].count}`);

        console.log('Checking view output for week 15...');
        const viewRes = await pool.query('SELECT COUNT(*) FROM player_weekly_stats_view WHERE season_year = 2025 AND week_num = 15');
        console.log(`View Rows (Week 15): ${viewRes.rows[0].count}`);

        if (viewRes.rows[0].count > 0) {
            const sample = await pool.query('SELECT * FROM player_weekly_stats_view WHERE season_year = 2025 AND week_num = 15 LIMIT 1');
            console.log('Sample Row:', sample.rows[0]);
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkData();
