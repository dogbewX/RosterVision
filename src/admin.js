import '../style.css';
import { authService } from './services/authService.js';
import { parseCSVForImport } from './dataProcessor.js';

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const yearInput = document.getElementById('yearInput');
const weekInput = document.getElementById('weekInput');
const logOutput = document.getElementById('logOutput');

// Auth Guard
const currentUser = authService.getCurrentUser();
if (!currentUser || currentUser.type !== 'Admin') {
    alert("Access Denied: Admins Only");
    window.location.href = '/';
}

// Populate Year (Current to +5)
const currentYear = new Date().getFullYear();
for (let i = 0; i <= 5; i++) {
    const year = currentYear + i;
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearInput.appendChild(option);
}

// Populate Weeks (1-16)
for (let i = 1; i <= 16; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    weekInput.appendChild(option);
}

function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.textContent = `> ${msg}`;
    if (type === 'error') div.style.color = 'red';
    if (type === 'success') div.style.color = 'green';
    if (type === 'warning') div.style.color = 'orange';
    logOutput.appendChild(div);
    logOutput.scrollTop = logOutput.scrollHeight;
}

uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const year = parseInt(yearInput.value);
    const week = parseInt(weekInput.value);
    const overwrite = document.getElementById('overwriteCheckbox').checked;

    if (!file) {
        return log("Please select a file first.", 'error');
    }

    // Clear previous logs
    logOutput.innerHTML = '';

    log(`Reading file: ${file.name}...`);
    if (overwrite) log("Note: Overwrite mode is enabled.");

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const csvText = e.target.result;
            log(`Parsing CSV (${csvText.length} bytes)...`);

            const players = parseCSVForImport(csvText);
            log(`Parsed ${players.length} valid entries.`);

            if (players.length === 0) {
                return log("No valid players found in CSV.", 'error');
            }

            log(`Uploading to Server (Year: ${year}, Week: ${week})...`);
            log("Import in progress... Please wait.", 'warning');

            const res = await fetch('/api/players/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ players, year, week, overwrite })
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Upload failed');

            log(`Success: ${result.message}`, 'success');
            log(`You can now return to the Dashboard.`);

        } catch (err) {
            log(`Error: ${err.message}`, 'error');
            console.error(err);
        }
    };

    reader.readAsText(file);
});
