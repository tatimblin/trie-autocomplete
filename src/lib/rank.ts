// Orders the words that could complete a prefix. A word's score is how
// common it is, estimated from its place in the word list (Zipf's law: the
// nth most common word turns up about 1/n as often as the first), plus a
// boost for having been typed in the field already (see Session).
import type { Search } from "./suggest";
import type { Session } from "./session";

export interface Sources {
	/** Words in the word list starting with a prefix, most common first. */
	search: (prefix: string) => string[];
	/** The word list, most common first. */
	words: readonly string[];
	/** What's been typed so far, if anything. */
	session?: Session;
}

/** A word outside the word list ranks as if it came this far down it. */
const UNLISTED = 100_000;

export function ranker({ search, words, session }: Sources): Search {
	const rankOf = new Map(words.map((word, rank) => [word, rank]));

	/** About how often `word` is used, as a share of all words. */
	const frequency = (word: string) => 0.1 / ((rankOf.get(word) ?? UNLISTED) + 1);

	return (prefix, prior) => {
		const listed = search(prefix);
		// Nothing typed yet: the list's order is the frequency order.
		if (!session?.size) return listed;

		const candidates = new Set(listed);
		for (const word of session.words()) if (word.startsWith(prefix)) candidates.add(word);
		// Sorting is stable, so ties keep the list's order.
		return [...candidates]
			.map((word) => ({ word, score: frequency(word) + session.boost(word, prior) }))
			.sort((a, b) => b.score - a.score)
			.map(({ word }) => word);
	};
}
