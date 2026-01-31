const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function createView() {
    try {
        console.log('Creating view player_weekly_stats_view...');
        const query = `
            CREATE OR REPLACE VIEW player_weekly_stats_view AS
            SELECT
                p.id AS player_id,
                p.first_name,
                p.last_name,
                p.position,
                ws.season_year,
                ws.week_num,
                ws.salary,
                ws.fppg,
                ws.team,
                ws.opponent,
                ws.injury_status
            FROM
                players p
            JOIN
                weekly_stats ws ON p.id = ws.player_id;
        `;
        await pool.query(query);
        console.log('View created successfully.');
    } catch (err) {
        console.error('Failed to create view:', err);
    } finally {
        await pool.end();
    }
}

createView();
