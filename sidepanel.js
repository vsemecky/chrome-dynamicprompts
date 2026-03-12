const templateEl = document.getElementById('template');
const resultEl = document.getElementById('result');
const generateBtn = document.getElementById('generateBtn');
const insertBtn = document.getElementById('insertBtn');
const generateInsertBtn = document.getElementById('generateInsertBtn');
const oneLineChk = document.getElementById('oneLineChk');
const statusEl = document.getElementById('status');

function postProcess(text) {
    if (!oneLineChk.checked) return text;
    return text.split('\n').map(l => l.trim()).filter(l => l).join(' ');
}

// Persist template across sessions
templateEl.value = localStorage.getItem('dp_template') || '';
templateEl.addEventListener('input', () => {
    localStorage.setItem('dp_template', templateEl.value);
});

generateBtn.addEventListener('click', () => {
    const template = templateEl.value.trim();
    if (!template) return;
    const result = postProcess(generate(template));
    resultEl.value = result;
    insertBtn.disabled = false;
    setStatus('');
});

insertBtn.addEventListener('click', () => {
    const text = resultEl.value;
    if (!text) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            setStatus('🔴 No active tab found.');
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', text }, (response) => {
            if (chrome.runtime.lastError) {
                setStatus('🔴 Not supported on this page.');
            } else {
                setStatus('🟢 Inserted!');
            }
        });
    });
});

generateInsertBtn.addEventListener('click', () => {
    const template = templateEl.value.trim();
    if (!template) return;
    const text = postProcess(generate(template));
    resultEl.value = text;
    insertBtn.disabled = false;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            setStatus('🔴 No active tab found.');
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: 'insertPrompt', text }, (response) => {
            if (chrome.runtime.lastError) {
                setStatus('🔴 Not supported on this page.');
            } else {
                setStatus('🟢 Inserted!');
            }
        });
    });
});

function setStatus(msg) {
    statusEl.textContent = msg;
}
