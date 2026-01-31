const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = require('./config');
const ragService = require('./services/ragService');

const app = express();
const port = config.port;

const hasKey = !!process.env.GOOGLE_API_KEY;
console.log(`[Startup] GOOGLE_API_KEY available? ${hasKey}`);
if (!hasKey) {
    console.error("[Startup] CRITICAL: GOOGLE_API_KEY is missing! Check server/.env file.");
} else {
    console.log(`[Startup] Key found (length: ${process.env.GOOGLE_API_KEY.length})`);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../dist'))); // Serve Frontend

// DEBUG: Global Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// Database Connection
const pool = new Pool(config.db);

// Prevent crash on idle client errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process, just log.
});

pool.connect((err, client, release) => {
    if (err) {
        // This only catches initial connection errors
        console.error('Error acquiring client', err.stack);
        console.log('Continuing without DB connection (AI features will work, DB features will fail).');
        return;
    }
    console.log('Connected to PostgreSQL database');
    release();
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// --- Auth Routes ---
const bcrypt = require('bcrypt');

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hash]
        );
        // Default is Normal, we can just return that since we know it.
        const newUser = result.rows[0];
        newUser.type = 'Normal';

        res.json({ user: newUser, message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed', details: err.detail });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT u.*, ut.Description as role 
             FROM users u 
             JOIN user_types ut ON u.type = ut.TypeID 
             WHERE u.username = $1`,
            [username]
        );
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                type: user.role // Send 'Admin' or 'Normal'
            },
            message: 'Logged in'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- Player Routes ---
app.get('/api/players', async (req, res) => {
    let { year, week } = req.query;
    console.log(`[API] /players hit from ${req.ip} with query:`, req.query);

    try {
        // Default Year to current real year if not provided
        if (!year) year = new Date().getFullYear();

        // If week is not provided, find the max week for this year
        if (!week) {
            const maxRes = await pool.query(
                'SELECT MAX(week_num) as max_week FROM player_weekly_stats_view WHERE season_year = $1',
                [year]
            );
            week = maxRes.rows[0].max_week || 1; // Default to 1 if no data
            console.log(`[API] Auto-detected latest week: ${week} for year ${year}`);
        }

        const query = `
      SELECT player_id as id, first_name, last_name, position, 
             salary, fppg, team, opponent, injury_status
      FROM player_weekly_stats_view
      WHERE season_year = $1 AND week_num = $2
    `;
        const result = await pool.query(query, [year, week]);

        // Map to frontend format
        const players = result.rows.map(row => ({
            Id: row.id,
            First_Name: row.first_name,
            Last_Name: row.last_name,
            Position: row.position,
            Salary: row.salary,
            FPPG: row.fppg,
            Team: row.team,
            Opponent: row.opponent,
            Injury_Indicator: row.injury_status
        }));

        res.json({
            meta: { year, week },
            data: players
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Values Fetch Failed' });
    }
});

// Import Helper (Simple one-off for MVP)
app.post('/api/players/import', async (req, res) => {
    const { players, year = 2025, week = 16, overwrite = false } = req.body; // Default to next week if not provided

    if (!players || !Array.isArray(players)) return res.status(400).json({ error: 'Invalid data' });

    try {
        await pool.query('BEGIN');

        // Overwrite Logic: Clear existing stats for this week
        if (overwrite) {
            console.log(`[Import] Overwrite enabled. Clearing stats for Year: ${year}, Week: ${week}`);
            await pool.query(
                'DELETE FROM weekly_stats WHERE season_year = $1 AND week_num = $2',
                [year, week]
            );
        }

        for (const p of players) {
            // Upsert Player (Static)
            await pool.query(
                `INSERT INTO players (id, first_name, last_name, position) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name`,
                [p.Id, p.First_Name, p.Last_Name, p.Position]
            );

            // Upsert Stats (Dynamic)
            await pool.query(
                `INSERT INTO weekly_stats (player_id, season_year, week_num, salary, fppg, team, opponent, injury_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (player_id, season_year, week_num) DO UPDATE 
         SET salary=$4, fppg=$5, injury_status=$8`,
                [p.Id, year, week, p.Salary, p.FPPG, p.Team, p.Opponent, p.Injury_Indicator || null]
            );
        }
        await pool.query('COMMIT');
        res.json({ message: `Imported ${players.length} players` });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Import failed' });
    }
});

// --- Roster Routes ---
app.get('/api/rosters/:userId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rosters WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Fetch Failed' }); }
});

app.get('/api/rosters/latest/:userId', async (req, res) => {
    try {
        let year = new Date().getFullYear();

        // 1. Auto-detect current week
        const maxRes = await pool.query(
            'SELECT MAX(week_num) as max_week FROM player_weekly_stats_view WHERE season_year = $1',
            [year]
        );
        const week = maxRes.rows[0].max_week || 1;

        // 2. Get roster for THIS week specifically
        const rosterRes = await pool.query(
            'SELECT * FROM rosters WHERE user_id = $1 AND season_year = $2 AND week_num = $3 ORDER BY created_at DESC LIMIT 1',
            [req.params.userId, year, week]
        );

        if (rosterRes.rows.length === 0) return res.json([]);

        const roster = rosterRes.rows[0];

        // 2. Get players for this roster using VIEW
        const query = `
            SELECT v.player_id as id, v.first_name, v.last_name, v.position, 
                   v.salary, v.fppg, v.team, v.opponent, v.injury_status,
                   re.slot_type
            FROM roster_entries re
            JOIN player_weekly_stats_view v ON re.player_id = v.player_id
            WHERE re.roster_id = $1
              AND v.season_year = $2 
              AND v.week_num = $3
        `;

        const pRes = await pool.query(query, [roster.id, roster.season_year, roster.week_num]);

        const players = pRes.rows.map(row => ({
            id: row.id,
            name: `${row.first_name} ${row.last_name}`,
            pos: row.position,
            salary: row.salary,
            fppg: row.fppg,
            team: row.team,
            game: `${row.team} vs ${row.opponent}`,
            injury: row.injury_status,
            isFlex: row.slot_type === 'FLEX'
        }));

        res.json(players);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fetch Latest Failed' });
    }
});

app.post('/api/rosters', async (req, res) => {
    const { userId, entries, name } = req.body;
    try {
        await pool.query('BEGIN');

        let year = new Date().getFullYear();
        // Auto-detect current week
        const maxRes = await pool.query(
            'SELECT MAX(week_num) as max_week FROM player_weekly_stats_view WHERE season_year = $1',
            [year]
        );
        const week = maxRes.rows[0].max_week || 1;

        // Create Roster with auto-detected week
        const rRes = await pool.query(
            'INSERT INTO rosters (user_id, season_year, week_num, name) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, year, week, name || 'My Roster']
        );
        const rosterId = rRes.rows[0].id;

        // Add Entries
        // entries is expected to be [{ playerId, slotType }, ...]
        for (const entry of entries) {
            await pool.query(
                'INSERT INTO roster_entries (roster_id, player_id, slot_type) VALUES ($1, $2, $3)',
                [rosterId, entry.playerId, entry.slotType]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: 'Roster saved', id: rosterId });
    } catch (err) {
        console.error(err);
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Save failed' });
    }
});

// --- AI Routes ---
app.post('/api/ai/index', async (req, res) => {
    try {
        const mode = req.body.mode || 'full'; // Default to full if not specified
        const count = await ragService.buildIndex(mode);
        res.json({ message: `Indexing complete. Processed ${count} chunks.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Indexing failed', details: err.message });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    const { question } = req.body;
    try {
        const answer = await ragService.chat(question);
        res.json({ answer });
    } catch (err) {
        console.error(err);
        if (err.message.includes("Index not found")) {
            return res.status(404).json({ error: 'Index not found. Please run indexing first.' });
        }
        res.status(500).json({ error: 'Chat failed', details: err.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
