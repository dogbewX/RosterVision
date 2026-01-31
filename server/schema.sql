-- schema.sql

-- 1. User Types Table (Lookup)
CREATE TABLE IF NOT EXISTS user_types (
    TypeID SERIAL PRIMARY KEY,
    Description VARCHAR(50) NOT NULL
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    type INTEGER DEFAULT 1, -- References user_types manually or update constraint later
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Players Table (Static Info)
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(50) PRIMARY KEY, -- Using string ID from source
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    position VARCHAR(10)
);

-- 3. WeeklyStats Table (Dynamic Info)
CREATE TABLE IF NOT EXISTS weekly_stats (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) REFERENCES players(id),
    season_year INTEGER NOT NULL,
    week_num INTEGER NOT NULL,
    salary INTEGER,
    fppg FLOAT,
    team VARCHAR(10),
    opponent VARCHAR(10),
    injury_status VARCHAR(10),
    UNIQUE(player_id, season_year, week_num)
);

-- 4. Rosters Table
CREATE TABLE IF NOT EXISTS rosters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    season_year INTEGER NOT NULL,
    week_num INTEGER NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Roster Entries Table
CREATE TABLE IF NOT EXISTS roster_entries (
    id SERIAL PRIMARY KEY,
    roster_id INTEGER REFERENCES rosters(id) ON DELETE CASCADE,
    player_id VARCHAR(50) REFERENCES players(id),
    slot_type VARCHAR(10) -- e.g. 'QB', 'RB', 'FLEX'
);
