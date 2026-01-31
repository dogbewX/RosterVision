const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function updateWeek() {
    try {
        console.log('Updating weekly_stats week_num from 1 to 15...');
        const res = await pool.query('UPDATE weekly_stats SET week_num = 15 WHERE week_num = 1');
        console.log(`Updated ${res.rowCount} rows.`);
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await pool.end();
    }
}

updateWeek();
