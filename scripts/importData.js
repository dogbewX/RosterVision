const fs = require('fs');
const path = require('path');

async function importData() {
    const csvPath = path.join(__dirname, '../public/assets/FanDuel-players-list.csv');
    console.log(`Reading CSV from ${csvPath}`);

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const [headerLine, ...lines] = csvContent.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim());

    const players = lines.map(line => {
        // Handle commas inside quotes if valid CSV, but here we assume simple split for this dataset
        // (If the data has names like "Smith, John", this split is dangerous, but the preview shows "Smith-Njigba" etc, seemingly safe for now)
        const values = line.split(',');
        const row = {};

        headers.forEach((h, i) => {
            let val = values[i]?.trim();
            // Numeric conversions
            if (h === 'Salary' || h === 'FPPG') val = parseFloat(val);
            row[h] = val;
        });

        // Map to API expectation
        return {
            Id: row['Id'],
            First_Name: row['First Name'],
            Last_Name: row['Last Name'],
            Position: row['Position'],
            Salary: row['Salary'],
            FPPG: row['FPPG'],
            Team: row['Team'],
            Opponent: row['Opponent'],
            // Map "Injury Indicator" (CSV) to "Injury_Indicator" (API)
            Injury_Indicator: row['Injury Indicator'] || row['Injury_Indicator'] // fallback
        };
    });

    console.log(`Parsed ${players.length} players. Sending to API...`);

    const config = require('../server/config');

    try {
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${config.port}`;
        const response = await fetch(`${baseUrl}/api/players/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players })
        });
        const result = await response.json();
        console.log('Import Result:', result);
    } catch (err) {
        console.error('Import Failed:', err);
    }
}

importData();
