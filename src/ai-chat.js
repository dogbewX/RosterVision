const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatHistory = document.getElementById('chat-history');
const indexBtn = document.getElementById('index-btn');

// Auto-resize textarea
chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    sendBtn.disabled = this.value.trim() === '';
});

// Handle Keydown (Enter to send, Shift+Enter for newline)
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add User Message
    appendMessage('user', text);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Loading State
    const loadingId = appendMessage('ai', 'Thinking...', true);

    try {
        const res = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text })
        });

        const data = await res.json();

        // Remove Loading Message
        document.getElementById(loadingId).remove();

        if (data.error) {
            appendMessage('ai', `Error: ${data.error}`);
        } else {
            appendMessage('ai', data.answer);
        }

    } catch (err) {
        document.getElementById(loadingId).remove();
        appendMessage('ai', "Failed to contact server. Ensure backend is running.");
    }
}

function appendMessage(role, text, isLoading = false) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    if (isLoading) div.id = `msg-${Date.now()}`;

    // Simple markdown-ish formatting for code blocks if needed
    // For now, naive replacement
    let formattedText = text;
    if (!isLoading) {
        // Wrap basic code blocks for visual clarity
        formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    }

    div.innerHTML = `
        <div class="avatar">${role === 'user' ? 'U' : 'AI'}</div>
        <div class="content">${formattedText}</div>
    `;

    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return div.id;
}

async function triggerIndexing(mode = 'full') {
    const msg = mode === 'full'
        ? "This will delete the existing index and re-scan EVERYTHING. It may take a few minutes. Continue?"
        : "This will only embed NEW or CHANGED files (cached). Continue?";

    if (!confirm(msg)) return;

    const btn = mode === 'full' ? document.getElementById('index-btn') : document.getElementById('update-btn');
    const originalText = btn.innerText;

    btn.disabled = true;
    btn.innerText = "Indexing...";

    try {
        const res = await fetch('http://localhost:3000/api/ai/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        });
        const data = await res.json();
        alert(data.message || data.error);
    } catch (e) {
        alert("Indexing failed.");
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}
