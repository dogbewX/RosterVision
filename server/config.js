require('dotenv').config();

const config = {
    // Database Configuration
    db: {
        user: process.env.DB_USER || 'postgres', // Render Default User usually available in their dashboard
        host: process.env.DB_HOST || 'dpg-ct000000000000000000-a.oregon-postgres.render.com', // PLACEHOLDER
        database: process.env.DB_NAME || 'fanduel_dashboard',
        password: process.env.DB_PASSWORD || 'password_placeholder', // PLACEHOLDER
        port: process.env.DB_PORT || 5432,
        ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false } // Required for Render, disable for Local
    },
    // Server Configuration
    port: process.env.PORT || 3000,

    // Application Constants
    currentSeason: 2025,
    currentWeek: 16
};

// If running locally without a .env and without hardcoded credentials, 
// you might want to fallback to localhost for safety, BUT the user requested Render logic.
// So we keep the structure above. 

module.exports = config;
