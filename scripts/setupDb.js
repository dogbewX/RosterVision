const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../server/config');

async function setup() {
    // 1. Connect to default postgres to create DB
    const clientConfig = {
        user: config.db.user || 'postgres',
        host: config.db.host || 'localhost',
        password: config.db.password || 'outdoor',
        port: config.db.port || 5432,
        database: 'postgres' // Connect to default
    };

    console.log('Connecting to postgres...');
    let client = new Client(clientConfig);
    try {
        await client.connect();

        // Check DB existence
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'fanduel_dashboard'");
        if (res.rowCount === 0) {
            console.log('Creating database fanduel_dashboard...');
            await client.query('CREATE DATABASE fanduel_dashboard');
        } else {
            console.log('Database fanduel_dashboard already exists.');
        }
    } catch (err) {
        console.error('Initial connection/creation error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }

    // 2. Connect to New DB and Run Schema
    console.log('Connecting to fanduel_dashboard...');
    config.database = 'fanduel_dashboard';
    client = new Client(config);

    try {
        await client.connect();

        const schemaPath = path.join(__dirname, '../server/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema.sql...');
        await client.query(schemaSql);
        console.log('Schema applied successfully.');

    } catch (err) {
        console.error('Schema application failed:', err);
    } finally {
        await client.end();
    }
}

setup();
