import { describe, it, expect } from "vitest";
import { ranker } from "./rank";
import { Session } from "./session";
import { parseContext, suggest } from "./suggest";
import { search, words } from "./dictionary";

// A small word list, most common first.
const list = ["the", "to", "that", "this", "time", "trie", "email", "employ"];
const listSearch = (prefix: string) => list.filter((word) => word.startsWith(prefix));

function field(source = { search: listSearch, words: list }) {
	const session = new Session();
	const lookup = ranker({ ...source, session });
	return (text: string) => {
		session.observe(text);
		return suggest(lookup, parseContext(text));
	};
}

describe("ranker", () => {
	it("keeps the word list's order with nothing typed", () => {
		const lookup = ranker({ search: listSearch, words: list, session: new Session() });
		expect(lookup("t", null)).toEqual(["the", "to", "that", "this", "time", "trie"]);
	});

	it("works without a session", () => {
		expect(ranker({ search: listSearch, words: list })("em", null)).toEqual(["email", "employ"]);
	});

	it("suggests a word outside the list once it's been typed", () => {
		const guess = field();
		expect(guess("Ship the emb")).toEqual([]);
		expect(guess("Ship the embed today. Then the em")[0]).toBe("embed");
	});

	it("doesn't suggest a word until it's finished", () => {
		const guess = field();
		guess("emb");
		guess("embe");
		expect(guess("Then e")).not.toContain("embe");
	});

	it("puts a word used before ahead of a slightly more common one", () => {
		const guess = field();
		expect(guess("Ti")[0]).toBe("Time");
		expect(guess("A trie and a tri")[0]).toBe("trie");
	});

	it("follows a word with what followed it before", () => {
		const guess = field();
		expect(guess("The t")[0]).toBe("the");
		expect(guess("The trie stores words. The t")[0]).toBe("trie");
	});

	it("leaves very common words ahead of a word used once", () => {
		const guess = field();
		expect(guess("Our trie, my t")[0]).toBe("the");
	});

	it("ranks the real word list", () => {
		const guess = field({ search, words });
		expect(guess("Lunch with Priya on Friday? Priya said Fri")[0]).toBe("Friday");
		expect(guess("Lunch with Priya on Friday? Priya said Fri yes. Pr")[0]).toBe("Priya");
	});
});

describe("Session", () => {
	it("counts a word once however often the same text is seen", () => {
		const once = new Session();
		once.observe("embed the ");
		const twice = new Session();
		twice.observe("embed the ");
		twice.observe("embed the x");
		twice.observe("embed the ");
		expect(twice.boost("embed", null)).toBe(once.boost("embed", null));
	});

	it("counts a word again when the text holds it again", () => {
		const session = new Session();
		session.observe("embed ");
		const one = session.boost("embed", null);
		session.observe("embed embed ");
		expect(session.boost("embed", null)).toBeGreaterThan(one);
	});

	it("remembers words that were deleted", () => {
		const session = new Session();
		session.observe("embed ");
		session.observe("");
		expect([...session.words()]).toEqual(["embed"]);
		expect(session.boost("embed", null)).toBeGreaterThan(0);
	});

	it("learns a pair only across a plain space", () => {
		const session = new Session();
		session.observe("new embed. old, trie ");
		expect(session.boost("embed", "new")).toBeGreaterThan(session.boost("embed", null));
		expect(session.boost("trie", "old")).toBe(session.boost("trie", null));
	});
});
