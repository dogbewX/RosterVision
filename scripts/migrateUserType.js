const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function migrate() {
    try {
        console.log("Starting migration...");

        // Check if column exists
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'type';
`);

        if (res.rows.length === 0) {
            console.log("Adding 'type' column to 'users' table...");
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN type VARCHAR(20) DEFAULT 'Normal';
`);
            console.log("Column added successfully.");
        } else {
            console.log("Column 'type' already exists.");
        }

        // Verify
        const verify = await pool.query("SELECT id, username, type FROM users LIMIT 5");
        console.log("Verification Data:", verify.rows);

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await pool.end();
    }
}

migrate();
