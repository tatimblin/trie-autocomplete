// Orders the words that could complete a prefix. A word's score is how
// likely it is to come next: how common it is, estimated from its place in
// the word list (Zipf's law: the nth most common word turns up about 1/n as
// often as the first), blended with how often it follows the word before
// (see NextWords), plus a boost for having been typed in the field already
// (see Session).
import type { NextWords } from "./next-words";
import type { Search } from "./suggest";
import type { Session } from "./session";

export interface Sources {
	/** Words in the word list starting with a prefix, most common first. */
	search: (prefix: string) => string[];
	/** The word list, most common first. */
	words: readonly string[];
	/** The words likely to follow a word, if known. */
	nextWords?: NextWords;
	/** What's been typed so far, if anything. */
	session?: Session;
}

/** A word outside the word list ranks as if it came this far down it. */
const UNLISTED = 100_000;
/** How much the word before counts, when it's in NextWords, against how common the word is. */
const PRIOR_WEIGHT = 0.7;

export function ranker({ search, words, nextWords, session }: Sources): Search {
	const rankOf = new Map(words.map((word, rank) => [word, rank]));

	/** About how often `word` is used, as a share of all words. */
	const frequency = (word: string) => 0.1 / ((rankOf.get(word) ?? UNLISTED) + 1);

	return (prefix, prior) => {
		const listed = search(prefix);
		const next = prior === null ? undefined : nextWords?.get(prior);
		// Nothing else to go on: the list's order is the frequency order.
		if (!next && !session?.size) return listed;

		const candidates = new Set(listed);
		if (session) for (const word of session.words()) if (word.startsWith(prefix)) candidates.add(word);

		const score = (word: string) =>
			(next
				? PRIOR_WEIGHT * (next.get(word) ?? 0) + (1 - PRIOR_WEIGHT) * frequency(word)
				: frequency(word)) + (session?.boost(word, prior) ?? 0);
		// Sorting is stable, so ties keep the list's order.
		return [...candidates]
			.map((word) => ({ word, score: score(word) }))
			.sort((a, b) => b.score - a.score)
			.map(({ word }) => word);
	};
}
