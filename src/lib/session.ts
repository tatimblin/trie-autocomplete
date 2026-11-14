// What the field has seen typed since the page loaded: how often each word
// was used, and which words followed which. Words outside the word list
// (names, jargon) count too, so they can be suggested once they've been
// typed. It lives as long as the field does: a reload or destroy() starts
// a fresh one.
import { wordsIn } from "./suggest";

/** How much a word gains from being used, relative to how many words have been. */
const WORD_WEIGHT = 0.02;
/** How much a word gains from having followed the same word before. */
const PAIR_WEIGHT = 0.3;

const bump = (counts: Map<string, number>, word: string) => counts.set(word, (counts.get(word) ?? 0) + 1);

export class Session {
	private counts = new Map<string, number>();
	private pairs = new Map<string, Map<string, number>>();
	private pairTotals = new Map<string, number>();
	private total = 0;
	private seen = "";

	/**
	 * Learns from the field's text: its finished words and their pairs. Call
	 * it with the whole text on every change. A word counts as often as the
	 * text has held it at once, so the same text seen twice changes nothing,
	 * and deleting a word doesn't forget it.
	 */
	observe(text: string) {
		// Letters typed onto the word in progress finish nothing.
		if (text.startsWith(this.seen) && !/\s/.test(text.slice(this.seen.length))) return;
		this.seen = text;

		const counts = new Map<string, number>();
		const pairs = new Map<string, Map<string, number>>();
		for (const { word, prior } of wordsIn(text)) {
			bump(counts, word);
			if (prior === null) continue;
			if (!pairs.has(prior)) pairs.set(prior, new Map());
			bump(pairs.get(prior) as Map<string, number>, word);
		}

		for (const [word, count] of counts) {
			const gain = count - (this.counts.get(word) ?? 0);
			if (gain <= 0) continue;
			this.counts.set(word, count);
			this.total += gain;
		}
		for (const [prior, next] of pairs) {
			const known = this.pairs.get(prior) ?? new Map<string, number>();
			this.pairs.set(prior, known);
			for (const [word, count] of next) {
				const gain = count - (known.get(word) ?? 0);
				if (gain <= 0) continue;
				known.set(word, count);
				this.pairTotals.set(prior, (this.pairTotals.get(prior) ?? 0) + gain);
			}
		}
	}

	/** The words seen so far. */
	words(): IterableIterator<string> {
		return this.counts.keys();
	}

	get size() {
		return this.counts.size;
	}

	/** How much to add to `word`'s score after `prior`, for having been typed before. */
	boost(word: string, prior: string | null): number {
		let boost = 0;
		const count = this.counts.get(word);
		if (count) boost += (WORD_WEIGHT * count) / (this.total + 5);
		if (prior === null) return boost;
		const pair = this.pairs.get(prior)?.get(word);
		if (pair) boost += (PAIR_WEIGHT * pair) / ((this.pairTotals.get(prior) ?? 0) + 1);
		return boost;
	}
}
