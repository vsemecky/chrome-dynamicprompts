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
        const perm = await handle.queryPermission({ mode: 'read' });
        if (perm === 'granted') {
            dirHandle = handle;
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
        const handle = await window.showDirectoryPicker({ mode: 'read' });
        dirHandle = handle;
        folderNameEl.textContent = handle.name;
        await dbSet('wildcardDir', handle);
    } catch {
        // user cancelled
    }
});

function extractWildcardNames(template) {
    const names = new Set();
    for (const match of template.matchAll(/__([a-zA-Z0-9_-]+?)__/g)) {
        names.add(match[1].toLowerCase());
    }
    return names;
}

async function loadWildcards(template) {
    if (!dirHandle) return {};
    const names = extractWildcardNames(template);
    const wildcards = {};
    for (const name of names) {
        try {
            const fileHandle = await dirHandle.getFileHandle(`${name}.txt`);
            const file = await fileHandle.getFile();
            const text = await file.text();
            wildcards[name] = text.split('\n').map(l => l.trim()).filter(l => l);
        } catch {
            // file not found, skip
        }
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
    const wildcards = await loadWildcards(template);
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
    const wildcards = await loadWildcards(template);
    const text = postProcess(generate(template, wildcards));
    resultEl.value = text;
    insertBtn.disabled = false;
    sendInsert(text);
});

function setStatus(msg) {
    statusEl.textContent = msg;
}

initDirHandle();
