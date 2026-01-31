const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const config = require('./config');

const pool = new Pool(config.db);

async function initDB() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected!');

        // Read schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        let sql = fs.readFileSync(schemaPath, 'utf8');

        // Append the View definition if missing from schema.sql
        sql += `
        -- VIEW: player_weekly_stats_view
        DROP VIEW IF EXISTS player_weekly_stats_view;
        CREATE OR REPLACE VIEW player_weekly_stats_view AS
        SELECT 
            p.id as player_id,
            p.first_name as first_name,
            p.last_name as last_name,
            p.position as position,
            ws.salary as salary,
            ws.fppg as fppg,
            ws.team as team,
            ws.opponent as opponent,
            ws.injury_status as injury_status,
            ws.season_year,
            ws.week_num
        FROM weekly_stats ws
        JOIN players p ON ws.player_id = p.id;
        `;

        // Append Seed Data
        sql += `
        INSERT INTO user_types (TypeID, Description) VALUES (1, 'Normal'), (2, 'Admin') ON CONFLICT (TypeID) DO NOTHING;
        `;

        console.log('Running schema...');
        await client.query(sql);
        console.log('Schema applied successfully!');

        client.release();
    } catch (err) {
        console.error('Error initializing DB:', err);
    } finally {
        await pool.end();
    }
}

initDB();
