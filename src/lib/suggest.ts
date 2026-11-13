// Turns the text typed so far into ranked completions for the word under the
// cursor. Plain functions over a `search(prefix, prior)` so they test without
// Svelte.

/** Whole words starting with `prefix` (lowercase), best first. `prior` is the word before it, as in Context. */
export type Search = (prefix: string, prior: string | null) => string[];

export interface Context {
	/** The word being typed, as typed (case kept, leading punctuation dropped). Empty when there's nothing to complete. */
	partial: string;
	/** The word before it, lowercased; START at the start of the text or a sentence; null after other punctuation. */
	prior: string | null;
}

/** The prior at the start of the text or of a sentence. */
export const START = "<s>";

/** How many suggestions to cycle through. */
export const LIMIT = 10;

const WORD = /^[a-z]+$/i;
// Quotes, brackets and the like that can open a word: `"Wor`, `(wor`.
const OPENER = /^[^a-z0-9]+/i;
// Punctuation that can close one: `word,`, `word."`.
const CLOSER = /[^a-z0-9]+$/i;

// A sentence's last token: "end.", "end?)", `end!"`.
const ENDS = /[.!?]["'”’)\]]*$/;

// The word before `token`, if nothing separates them: "Hello wor" but not
// "Hello, wor" or `"Hello" wor`. START when `token` opens the text or a
// sentence: "Wor", "Hello. Wor".
function priorOf(before: string | undefined, token: string): string | null {
	if (OPENER.test(token)) return null;
	// The text's first token comes after "" when the text opens with a space.
	if (!before || ENDS.test(before)) return START;
	const word = before.replace(OPENER, "");
	return WORD.test(word) ? word.toLowerCase() : null;
}

/** Reads the word being typed and the word before it off the end of `text`. */
export function parseContext(text: string): Context {
	// \s also covers the non-breaking spaces contenteditable inserts.
	const tokens = text.split(/\s+/);
	const last = tokens.pop() ?? "";

	const stripped = last.replace(OPENER, "");
	// A token with anything but letters left ("word,", "e-ma", "3rd") is done or unknown.
	const partial = WORD.test(stripped) ? stripped : "";

	return { partial, prior: priorOf(tokens.pop(), last) };
}

export interface Typed {
	/** Lowercased. */
	word: string;
	/** The word before it, as in Context. */
	prior: string | null;
}

/**
 * The finished words in `text`, in order. The last token is the word being
 * typed unless a space follows it, so it isn't finished. Tokens that aren't
 * plain words ("e-mail", "don't", "3rd") are skipped.
 */
export function wordsIn(text: string): Typed[] {
	const tokens = text.split(/\s+/);
	tokens.pop();
	const found: Typed[] = [];
	tokens.forEach((token, i) => {
		const word = token.replace(OPENER, "").replace(CLOSER, "");
		if (WORD.test(word)) found.push({ word: word.toLowerCase(), prior: priorOf(tokens[i - 1], token) });
	});
	return found;
}

/** `word` spelled to continue `partial`: its typed letters, then the rest, in caps if `partial` is. */
export function matchCase(partial: string, word: string): string {
	const rest = word.slice(partial.length);
	const shouting = partial.length > 1 && partial === partial.toUpperCase();
	return partial + (shouting ? rest.toUpperCase() : rest);
}

/** Up to `limit` whole words that complete the context's partial word, best first. */
export function suggest(search: Search, context: Context, limit = LIMIT): string[] {
	const { partial, prior } = context;
	if (!partial) return [];
	return search(partial.toLowerCase(), prior)
		.slice(0, limit)
		.map((word) => matchCase(partial, word));
}

/** Moves `index` by `delta` through `length` suggestions, wrapping at both ends. */
export function cycle(index: number, delta: number, length: number): number {
	if (length <= 0) return 0;
	return (((index + delta) % length) + length) % length;
}
