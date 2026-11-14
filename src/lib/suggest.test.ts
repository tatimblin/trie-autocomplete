import { describe, it, expect } from "vitest";
import { cycle, matchCase, parseContext, suggest } from "./suggest";
import { search, words } from "./dictionary";
import { parseWords } from "./words";

describe("parseContext", () => {
	it("reads the partial word and the one before it", () => {
		expect(parseContext("Hello Wor")).toEqual({ partial: "Wor", prior: "hello" });
	});

	it("has nothing to complete after a space or punctuation", () => {
		expect(parseContext("Hello ").partial).toBe("");
		expect(parseContext("Hello,").partial).toBe("");
		expect(parseContext("e-ma").partial).toBe("");
	});

	it("drops an opening quote or bracket", () => {
		expect(parseContext('She said "Wor')).toEqual({ partial: "Wor", prior: null });
		expect(parseContext("(wor").partial).toBe("wor");
	});

	it("splits on non-breaking spaces from contenteditable", () => {
		expect(parseContext("Hello wor")).toEqual({ partial: "wor", prior: "hello" });
	});

	it("has no prior word across punctuation", () => {
		expect(parseContext("Hello. Wor").prior).toBeNull();
		expect(parseContext("Hello, wor").prior).toBeNull();
		expect(parseContext("wor").prior).toBeNull();
	});
});

describe("matchCase", () => {
	it("keeps what was typed and continues in lowercase", () => {
		expect(matchCase("Wor", "world")).toBe("World");
		expect(matchCase("wor", "world")).toBe("world");
	});

	it("continues in caps when the partial is in caps", () => {
		expect(matchCase("WOR", "world")).toBe("WORLD");
		// One capital is a sentence start, not shouting.
		expect(matchCase("W", "world")).toBe("World");
	});
});

describe("cycle", () => {
	it("wraps at both ends", () => {
		expect(cycle(0, -1, 3)).toBe(2);
		expect(cycle(2, 1, 3)).toBe(0);
		expect(cycle(1, 1, 3)).toBe(2);
	});

	it("stays at 0 with nothing to cycle", () => {
		expect(cycle(0, 1, 0)).toBe(0);
		expect(cycle(0, -1, 0)).toBe(0);
	});
});

describe("search", () => {
	it("ranks by frequency", () => {
		expect(search("wor").slice(0, 3)).toEqual(["world", "work", "working"]);
	});

	it("does not resume from the previous search", () => {
		// @tristimb/data-structures before 0.6.2 answered "y" with ["they"] after "the".
		search("the");
		expect(search("y")[0]).toBe("you");
		search("wor");
		expect(search("d")[0]).not.toMatch(/^word/);
	});

	it("answers nothing for an empty prefix", () => {
		search("wor");
		expect(search("")).toEqual([]);
	});
});

describe("words", () => {
	it("drops stray single letters but keeps a and i", () => {
		expect(parseWords("the\nn\na\nb\ni\nthe\n")).toEqual(["the", "a", "i"]);
		expect(words).not.toContain("n");
		expect(words.slice(0, 3)).toEqual(["the", "of", "and"]);
	});
});

describe("suggest", () => {
	it("completes in the typed case, capped", () => {
		const got = suggest(search, parseContext("Hello Wor"));
		expect(got[0]).toBe("World");
		expect(got.length).toBeLessThanOrEqual(10);
	});

	it("offers a real word for a single letter", () => {
		expect(suggest(search, parseContext("b"))[0]).toBe("by");
	});

	it("suggests nothing without a partial word", () => {
		expect(suggest(search, parseContext("Hello "))).toEqual([]);
	});
});
