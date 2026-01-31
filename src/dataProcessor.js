
export function parseCSV(csvText) {
    if (!csvText) return [];

    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    // Map header names to indices
    const idx = {
        id: headers.indexOf('Id'),
        pos: headers.indexOf('Position'),
        name: headers.indexOf('Nickname'),
        fppg: headers.indexOf('FPPG'),
        salary: headers.indexOf('Salary'),
        game: headers.indexOf('Game'),
        team: headers.indexOf('Team'),
        opp: headers.indexOf('Opponent'),
        injury: headers.indexOf('Injury Indicator'),
        details: headers.indexOf('Injury Details')
    };

    const players = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const row = line.split(',');

        const fppg = parseFloat(row[idx.fppg]) || 0;
        const salary = parseInt(row[idx.salary]) || 0;

        // Calculate Value Score (Points per $1000)
        const valueScore = salary > 0 ? (fppg / salary) * 1000 : 0;

        players.push({
            id: row[idx.id],
            pos: row[idx.pos],
            name: row[idx.name],
            team: row[idx.team],
            opp: row[idx.opp],
            game: row[idx.game],
            fppg: fppg,
            salary: salary,
            injury: row[idx.injury],
            injuryDetails: row[idx.details],
            value: valueScore
        });
    }
    return players;
}

export function parseCSVForImport(csvText) {
    if (!csvText) throw new Error("File is empty");

    const lines = csvText.split('\n');
    if (lines.length < 2) throw new Error("File has no data rows");

    const headers = lines[0].split(',').map(h => h.trim());

    // Required Headers for Server Import
    const requiredMap = {
        'Id': 'Id',
        'First Name': 'First_Name',
        'Last Name': 'Last_Name',
        'Position': 'Position',
        'Salary': 'Salary',
        'FPPG': 'FPPG',
        'Team': 'Team',
        'Opponent': 'Opponent',
        'Injury Indicator': 'Injury_Indicator'
    };

    const columnMap = {};
    const missing = [];

    // Validate Headers
    Object.keys(requiredMap).forEach(reqHeader => {
        const index = headers.indexOf(reqHeader);
        if (index === -1) {
            missing.push(reqHeader);
        } else {
            columnMap[reqHeader] = index;
        }
    });

    if (missing.length > 0) {
        throw new Error(`Invalid File Format. Missing headers: ${missing.join(', ')}`);
    }

    // Optional Headers
    const injuryDetailsIdx = headers.indexOf('Injury Details');

    const players = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const row = line.split(',');

        // Construct Server Object
        const p = {};
        Object.keys(requiredMap).forEach(reqHeader => {
            const serverKey = requiredMap[reqHeader];
            const val = row[columnMap[reqHeader]];

            // Numeric conversions
            if (reqHeader === 'Salary' || reqHeader === 'FPPG') {
                p[serverKey] = parseFloat(val) || 0;
            } else {
                p[serverKey] = val ? val.trim() : '';
            }
        });

        if (injuryDetailsIdx !== -1) {
            p.Injury_Details = row[injuryDetailsIdx];
        }

        players.push(p);
    }

    return players;
}

export function filterPlayers(players, filters) {
    return players.filter(p => {
        let matchesPosition = false;
        const posFilter = filters.position || 'ALL'; // Defensive fallback

        if (posFilter === 'ALL') {
            matchesPosition = true;
        } else if (posFilter === 'FLEX') {
            matchesPosition = ['RB', 'WR', 'TE'].includes(p.pos);
        } else {
            matchesPosition = p.pos === posFilter;
        }

        const matchesSalary = p.salary <= filters.maxSalary;

        const search = filters.search.toLowerCase();
        const matchesSearch = !search ||
            (p.name && p.name.toLowerCase().includes(search)) ||
            (p.team && p.team.toLowerCase().includes(search));

        // Show IR check
        // If filters.showIR is TRUE -> Match everything (don't filter out IR/Out).
        // If filters.showIR is FALSE -> Filter OUT players with 'IR' or 'O'.
        const matchesIR = filters.showIR ? true : (p.injury !== 'IR' && p.injury !== 'O');

        return matchesPosition && matchesSalary && matchesSearch && matchesIR;
    });
}

export function sortPlayers(players, sortBy) {
    const sorted = [...players];
    sorted.sort((a, b) => {
        const [key, dir] = sortBy.split('-');
        const valA = a[key] || 0;
        const valB = b[key] || 0;
        return dir === 'asc' ? valA - valB : valB - valA;
    });
    return sorted;
}
