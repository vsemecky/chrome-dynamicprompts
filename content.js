// Inserts text into the prompt editor of supported AI sites.
// Tries multiple editor types in order: TipTap/ProseMirror, textarea, contenteditable.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "insertPrompt") {
        insertPrompt(message.text);
        sendResponse({ ok: true });
    }
});

function insertPrompt(text) {
    // TipTap/ProseMirror (e.g. Grok) — requires execCommand, setting textContent doesn't work
    const proseMirror = document.querySelector('.ProseMirror');
    if (proseMirror) {
        proseMirror.focus();
        document.execCommand('selectAll');
        document.execCommand('insertText', false, text);
        return;
    }

    // Standard textarea (e.g. Kling AI)
    const textarea = document.querySelector('textarea');
    if (textarea) {
        textarea.focus();
        textarea.select();
        document.execCommand('insertText', false, text);
        return;
    }

    // Generic contenteditable fallback
    const editable = document.querySelector('[contenteditable="true"]');
    if (editable) {
        editable.focus();
        document.execCommand('selectAll');
        document.execCommand('insertText', false, text);
        return;
    }

    console.warn("Dynamic Prompts: prompt editor not found");
}
