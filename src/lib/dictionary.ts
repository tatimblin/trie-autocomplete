import { Trie } from "@tristimb/data-structures";
import document from "$lib/10000-common-words.txt?raw";
import { parseWords } from "$lib/words";

/** Words most common first; a word's index is its frequency rank. */
export const words = parseWords(document);

const trie = new Trie();
// The weight is the rank, and search() sorts by weight, so results come back
// most common first.
words.forEach((word, rank) => trie.add(word, rank));

// A prefix no word starts with, searched to reset the Trie (see below).
const RESET = "\u0000";

/**
 * Every word starting with `prefix`, most common first.
 *
 * Trie.search (in @tristimb/data-structures 0.5.0) resumes from the node the
 * previous search ended on, so after "the" a search for "y" walks t-h-e-y and
 * answers ["they"]. A search that fails sends it back to the root, so one
 * runs first. An empty prefix answers nothing rather than a whole subtree.
 */
export function search(prefix: string): string[] {
	if (!prefix) return [];
	trie.search(RESET);
	return trie.search(prefix);
}
