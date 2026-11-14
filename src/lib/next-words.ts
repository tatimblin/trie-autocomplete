// The words likely to follow a word, from src/lib/data/next-words.txt
// (built by scripts/build-next-words.mjs from Tatoeba; see NOTICE). Each
// line is a word, or "<s>" for the start of a sentence, then the words that
// most often follow it, most common first.

/** For each word, how likely each of its followers is to come next. */
export type NextWords = Map<string, Map<string, number>>;

/** The share of the time the next word is one of the listed followers, roughly. */
const LISTED = 0.5;

/**
 * Reads the table. The file keeps only the order of the followers, so the
 * nth gets a share in proportion to 1/n (Zipf's law), the shares summing to
 * LISTED.
 */
export function parseNextWords(text: string): NextWords {
	const table: NextWords = new Map();
	for (const line of text.split("\n")) {
		const [prior, ...next] = line.trim().split(/\s+/);
		if (!prior || !next.length) continue;
		const harmonic = next.reduce((sum, _, i) => sum + 1 / (i + 1), 0);
		table.set(prior, new Map(next.map((word, i) => [word, LISTED / (i + 1) / harmonic])));
	}
	return table;
}
