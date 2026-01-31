const { Pool } = require('pg');
const path = require('path');
const config = require('../server/config');

const pool = new Pool(config.db);

async function checkUser() {
    try {
        const res = await pool.query(`
            SELECT u.username, u.type, ut.Description 
            FROM users u
            JOIN user_types ut ON u.type = ut.TypeID
            WHERE u.username = 'dogbew'
    `);
        console.log("Current User Role:", res.rows[0]);

        // Auto-fix if needed (For testing)
        if (res.rows[0].description !== 'Admin') {
            console.log("Upgrading 'dogbew' to Admin...");
            await pool.query("UPDATE users SET type = (SELECT TypeID FROM user_types WHERE Description='Admin') WHERE username='dogbew'");
            console.log("User upgraded.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkUser();
