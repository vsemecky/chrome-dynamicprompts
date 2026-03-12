// Grok Imagine uses TipTap/ProseMirror (contenteditable .ProseMirror div).
// We insert text via execCommand which TipTap picks up correctly.
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "insertPrompt") {
        insertPrompt(message.text);
    }
});

function insertPrompt(text) {
    const editor = document.querySelector('.ProseMirror');
    if (!editor) {
        console.warn("Dynamic Prompts: prompt editor not found");
        return;
    }
    editor.focus();
    document.execCommand('selectAll');
    document.execCommand('insertText', false, text);
}
