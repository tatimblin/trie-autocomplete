// Turns the text typed so far into ranked completions for the word under the
// cursor. Plain functions over a `search(prefix)` so they test without Svelte.

export type Search = (prefix: string) => string[];

export interface Context {
	/** The word being typed, as typed (case kept, leading punctuation dropped). Empty when there's nothing to complete. */
	partial: string;
	/** The word before it, lowercased, or null at the start of the text or after punctuation. */
	prior: string | null;
}

/** How many suggestions to cycle through. */
export const LIMIT = 10;

const WORD = /^[a-z]+$/i;
// Quotes, brackets and the like that can open a word: `"Wor`, `(wor`.
const OPENER = /^[^a-z0-9]+/i;

/** Reads the word being typed and the word before it off the end of `text`. */
export function parseContext(text: string): Context {
	// \s also covers the non-breaking spaces contenteditable inserts.
	const tokens = text.split(/\s+/);
	const last = tokens.pop() ?? "";
	const before = tokens.pop();

	const stripped = last.replace(OPENER, "");
	// A token with anything but letters left ("word,", "e-ma", "3rd") is done or unknown.
	const partial = WORD.test(stripped) ? stripped : "";

	// A prior word only counts if nothing separates it from this one: "Hello wor"
	// but not "Hello. Wor", "Hello, wor" or `"Hello" wor`.
	let prior: string | null = null;
	if (before !== undefined && !OPENER.test(last)) {
		const word = before.replace(OPENER, "");
		if (WORD.test(word)) prior = word.toLowerCase();
	}

	return { partial, prior };
}

/** `word` spelled to continue `partial`: its typed letters, then the rest, in caps if `partial` is. */
export function matchCase(partial: string, word: string): string {
	const rest = word.slice(partial.length);
	const shouting = partial.length > 1 && partial === partial.toUpperCase();
	return partial + (shouting ? rest.toUpperCase() : rest);
}

/** Up to `limit` whole words that complete the context's partial word, best first. */
export function suggest(search: Search, context: Context, limit = LIMIT): string[] {
	const { partial } = context;
	if (!partial) return [];
	return search(partial.toLowerCase())
		.slice(0, limit)
		.map((word) => matchCase(partial, word));
}

/** Moves `index` by `delta` through `length` suggestions, wrapping at both ends. */
export function cycle(index: number, delta: number, length: number): number {
	if (length <= 0) return 0;
	return (((index + delta) % length) + length) % length;
}
