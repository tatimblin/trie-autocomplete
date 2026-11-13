// The word list, src/lib/10000-common-words.txt, is ordered by frequency
// (most common first), so a word's line number is its rank. It comes from a
// web crawl, so it also carries stray single letters ("n", "b", "t", …) that
// rank above real words and would otherwise shadow them as exact matches.
const LETTERS = new Set(["a", "i"]);

/** Splits the list into ranked words: trimmed, lowercased, deduped, no junk. */
export function parseWords(text: string): string[] {
	const words = new Set<string>();
	for (const line of text.split("\n")) {
		const word = line.trim().toLowerCase();
		if (!word || (word.length === 1 && !LETTERS.has(word))) continue;
		words.add(word);
	}
	return [...words];
}
