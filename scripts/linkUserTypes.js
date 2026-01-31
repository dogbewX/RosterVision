const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function migrate() {
    try {
        console.log("Starting FK Refactor...");

        // 1. Seed user_types
        // We use ON CONFLICT to avoid errors if run multiple times
        // Note: serial won't conflict, so we just query first.
        const types = ['Normal', 'Admin'];
        for (const t of types) {
            const check = await pool.query("SELECT TypeID FROM user_types WHERE Description = $1", [t]);
            if (check.rows.length === 0) {
                await pool.query("INSERT INTO user_types (Description) VALUES ($1)", [t]);
                console.log(`Seeded type: ${t} `);
            }
        }

        // 2. Add temporary column
        console.log("Adding temp column...");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS type_temp INTEGER");

        // 3. Migrate Data
        // Map 'Normal' string to the ID of 'Normal', etc.
        console.log("Mapping existing data...");
        await pool.query(`
            UPDATE users 
            SET type_temp = ut.TypeID
            FROM user_types ut
            WHERE users.type = ut.Description
    `);
        // Fallback for NULLs/Unmatched
        await pool.query(`
            UPDATE users 
            SET type_temp = (SELECT TypeID FROM user_types WHERE Description = 'Normal')
            WHERE type_temp IS NULL
    `);

        // 4. Drop old column and Rename new one
        console.log("Swapping columns...");
        await pool.query("ALTER TABLE users DROP COLUMN type");
        await pool.query("ALTER TABLE users RENAME COLUMN type_temp TO type");

        // 5. Add FK Constraint
        console.log("Adding Constraint...");
        await pool.query(`
            ALTER TABLE users 
            ADD CONSTRAINT fk_user_type 
            FOREIGN KEY(type) 
            REFERENCES user_types(TypeID)
        `);

        // 6. Set Default
        // Find ID for Normal
        const normRes = await pool.query("SELECT TypeID FROM user_types WHERE Description='Normal'");
        const normId = normRes.rows[0].typeid;
        await pool.query(`ALTER TABLE users ALTER COLUMN type SET DEFAULT ${normId} `);

        console.log("Refactor Complete!");

    } catch (e) {
        console.error("Refactor failed:", e);
    } finally {
        await pool.end();
    }
}

migrate();
