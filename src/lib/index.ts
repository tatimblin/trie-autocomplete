// place files you want to import through the `$lib` alias in this folder.

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}

export function sanitize(el: HTMLElement) {
    el.querySelectorAll("br").forEach((br) => br.remove());
}