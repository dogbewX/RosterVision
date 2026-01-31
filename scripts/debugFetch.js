const config = require('../server/config');

async function debugFetch() {
    try {
        const baseUrl = process.env.API_BASE_URL || `http://localhost:${config.port}`;
        const response = await fetch(`${baseUrl}/api/players?year=2025&week=15`);
        console.log('Status:', response.status);
        if (!response.ok) {
            console.log('Error text:', await response.text());
            return;
        }
        const data = await response.json();
        console.log('Data length:', data.length);
        if (data.length > 0) {
            console.log('First item:', JSON.stringify(data[0], null, 2));
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

debugFetch();
