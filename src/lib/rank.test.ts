import { describe, it, expect } from "vitest";
import { ranker, type Sources } from "./rank";
import { Session } from "./session";
import { parseContext, suggest } from "./suggest";
import { nextWords, search, words } from "./dictionary";
import { parseNextWords } from "./next-words";

// A small word list, most common first.
const list = ["the", "to", "that", "this", "time", "trie", "email", "employ"];
const listSearch = (prefix: string) => list.filter((word) => word.startsWith(prefix));

function field(source: Omit<Sources, "session"> = { search: listSearch, words: list }) {
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

describe("parseNextWords", () => {
	it("gives earlier followers bigger shares, summing to a half", () => {
		const table = parseNextWords("new york car job\n<s> i\n\nlonely\n");
		const york = table.get("new");
		expect([...(york?.keys() ?? [])]).toEqual(["york", "car", "job"]);
		expect(york?.get("york")).toBeGreaterThan(york?.get("car") ?? 1);
		expect([...(york?.values() ?? [])].reduce((a, b) => a + b)).toBeCloseTo(0.5);
		expect(table.get("<s>")?.get("i")).toBeCloseTo(0.5);
		// A word with no followers isn't kept.
		expect(table.has("lonely")).toBe(false);
	});

	it("reads the shipped table", () => {
		expect(nextWords.size).toBeGreaterThan(400);
		expect(nextWords.get("new")?.has("york")).toBe(true);
	});
});

describe("ranker with the word before", () => {
	const table = parseNextWords("i want think\nwant to\n<s> this");

	it("puts the usual follower first", () => {
		const lookup = ranker({ search: listSearch, words: list, nextWords: table });
		expect(lookup("t", null)[0]).toBe("the");
		expect(lookup("t", "want")[0]).toBe("to");
		expect(lookup("t", "<s>")[0]).toBe("this");
	});

	it("keeps frequency order after a word it doesn't know", () => {
		const lookup = ranker({ search: listSearch, words: list, nextWords: table });
		expect(lookup("t", "banana")).toEqual(listSearch("t"));
	});

	it("lets a pair typed in the field beat the table", () => {
		const guess = field({ search, words, nextWords });
		expect(guess("I want t")[0]).toBe("to");
		expect(guess("I want tea. I want t")[0]).toBe("tea");
	});

	it("guesses from the first letter with the real table", () => {
		const guess = field({ search, words, nextWords });
		expect(guess("I want t")[0]).toBe("to");
		expect(guess("Have a g")[0]).toBe("good");
		expect(guess("New Y")[0]).toBe("York");
		expect(guess("What do you t")[0]).toBe("think");
		expect(guess("I am g")[0]).toBe("going");
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
