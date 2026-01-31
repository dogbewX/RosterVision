const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function migrate() {
    try {
        console.log("Creating 'user_types' table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_types(
    TypeID SERIAL PRIMARY KEY,
    Description VARCHAR(50) NOT NULL
);
`);
        console.log("Table created.");

        // Optional: Seed data?
        // const count = await pool.query('SELECT count(*) FROM user_types');
        // if (count.rows[0].count == 0) {
        //    await pool.query("INSERT INTO user_types (Description) VALUES ('Normal'), ('Admin')");
        //    console.log("Seeded default types.");
        // }

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await pool.end();
    }
}

migrate();
