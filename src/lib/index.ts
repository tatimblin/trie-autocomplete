// place files you want to import through the `$lib` alias in this folder.

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}

export function sanitize(el: HTMLElement) {
    el.querySelectorAll("br").forEach((br) => br.remove());
}

// Puts the caret at the end of `el`. Selecting its contents and collapsing to
// the end holds however the browser has split the text into nodes, where an
// offset into the first text node can overrun it (and throw) or fall short.
export function setCursor(el: HTMLElement) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
}