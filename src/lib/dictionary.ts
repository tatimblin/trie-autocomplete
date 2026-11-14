import { Trie } from "@tristimb/data-structures";
import document from "$lib/10000-common-words.txt?raw";
import { parseWords } from "$lib/words";
import nextDocument from "$lib/data/next-words.txt?raw";
import { parseNextWords } from "$lib/next-words";

/** Words most common first; a word's index is its frequency rank. */
export const words = parseWords(document);

/** The words likely to follow each common word. */
export const nextWords = parseNextWords(nextDocument);

const trie = new Trie();
// The weight is the rank, and search() sorts by weight, so results come back
// most common first.
words.forEach((word, rank) => trie.add(word, rank));

/** Every word starting with `prefix`, most common first; nothing for "". */
export function search(prefix: string): string[] {
	return trie.search(prefix);
}
