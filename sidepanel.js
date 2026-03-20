const templateEl = document.getElementById('template');
const resultEl = document.getElementById('result');
const generateBtn = document.getElementById('generateBtn');
const insertBtn = document.getElementById('insertBtn');
const generateInsertBtn = document.getElementById('generateInsertBtn');
const oneLineChk = document.getElementById('oneLineChk');
const folderBtn = document.getElementById('folderBtn');
const folderNameEl = document.getElementById('folderName');
const statusEl = document.getElementById('status');

// --- IndexedDB helpers for persisting the directory handle ---

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('dynamicprompts', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('kv');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function dbGet(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const req = db.transaction('kv').objectStore('kv').get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function dbSet(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const req = db.transaction('kv', 'readwrite').objectStore('kv').put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

// --- Wildcard folder ---

let dirHandle = null;

async function initDirHandle() {
    try {
        const handle = await dbGet('wildcardDir');
        if (!handle) return;
        dirHandle = handle;
        const perm = await handle.queryPermission({ mode: 'read' });
        if (perm === 'granted') {
            folderNameEl.textContent = handle.name;
        } else {
            folderNameEl.textContent = `${handle.name} (click to re-authorize)`;
        }
    } catch {
        // ignore
    }
}

folderBtn.addEventListener('click', async () => {
    try {
        if (dirHandle) {
            const perm = await dirHandle.queryPermission({ mode: 'read' });
            if (perm !== 'granted') {
                const result = await dirHandle.requestPermission({ mode: 'read' });
                if (result === 'granted') {
                    folderNameEl.textContent = dirHandle.name;
                    return;
                }
            }
        }
        const handle = await window.showDirectoryPicker({ mode: 'read' });
        dirHandle = handle;
        folderNameEl.textContent = handle.name;
        await dbSet('wildcardDir', handle);
    } catch {
        // user cancelled
    }
});

async function loadWildcards() {
    if (!dirHandle) return {};
    const wildcards = {};
    try {
        for await (const entry of dirHandle.values()) {
            if (entry.kind !== 'file' || !entry.name.endsWith('.txt')) continue;
            const name = entry.name.slice(0, -4).toLowerCase();
            const file = await entry.getFile();
            const text = await file.text();
            wildcards[name] = text.split('\n').map(l => l.trim()).filter(l => l);
        }
    } catch {
        setStatus('⚠️ Wildcard folder access lost — click 📁 to re-authorize.');
    }
    return wildcards;
}

// --- Core ---

function postProcess(text) {
    if (!oneLineChk.checked) return text;
    return text.split('\n').map(l => l.trim()).filter(l => l).join(' ');
}

function sendInsert(text) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) { setStatus('🔴 No active tab found.'); return; }
        chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', text }, () => {
            if (chrome.runtime.lastError) {
                setStatus('🔴 Not supported on this page.');
            } else {
                setStatus('🟢 Inserted!');
            }
        });
    });
}

// Persist template across sessions
templateEl.value = localStorage.getItem('dp_template') || '';
templateEl.addEventListener('input', () => {
    localStorage.setItem('dp_template', templateEl.value);
});

generateBtn.addEventListener('click', async () => {
    const template = templateEl.value.trim();
    if (!template) return;
    const wildcards = await loadWildcards();
    const result = postProcess(generate(template, wildcards));
    resultEl.value = result;
    insertBtn.disabled = false;
    setStatus('');
});

insertBtn.addEventListener('click', () => {
    const text = resultEl.value;
    if (!text) return;
    sendInsert(text);
});

generateInsertBtn.addEventListener('click', async () => {
    const template = templateEl.value.trim();
    if (!template) return;
    const wildcards = await loadWildcards();
    const text = postProcess(generate(template, wildcards));
    resultEl.value = text;
    insertBtn.disabled = false;
    sendInsert(text);
});

function setStatus(msg) {
    statusEl.textContent = msg;
}

function highlightActiveSite() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        document.querySelectorAll('.sites a').forEach(a => a.classList.remove('active'));
        if (!tabs[0]?.url) return;
        try {
            const tabHost = new URL(tabs[0].url).hostname;
            document.querySelectorAll('.sites a').forEach(a => {
                if (new URL(a.href).hostname === tabHost) a.classList.add('active');
            });
        } catch {}
    });
}

chrome.tabs.onActivated.addListener(highlightActiveSite);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) highlightActiveSite();
});

initDirHandle();
highlightActiveSite();
