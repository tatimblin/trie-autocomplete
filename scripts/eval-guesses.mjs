// Replays text through the app's own suggestion code and reports how often
// the first suggestion is the word being typed.
//
//   node scripts/eval-guesses.mjs [--doc N] [file.txt ...]
//   node scripts/eval-guesses.mjs --show "I want t" "New Y"
//
// It types each word a letter at a time into a growing text, the way the
// field sees it, and asks for suggestions after every letter:
// - right after 1 letter: the first suggestion is the word, after its first
//   letter (words of 2+ letters);
// - keystrokes saved: letters not typed when taking the first suggestion as
//   soon as it's right, less one key (Tab) to take it, over all letters.
// Text is cut into documents of N sentences (default 10), each typed into a
// fresh field, so what the field remembers lasts one document. The corpus is
// Tatoeba's held-out sentences (first 6,000; see tatoeba.mjs), plus any
// plain-text files given. Corpora are not committed.
//
// The modules load through Vite, so the script measures whatever src/lib
// holds; on a checkout without src/lib/rank.ts it falls back to plain search.
import fs from "node:fs";
import { createServer } from "vite";
import { ROOT, sentences } from "./tatoeba.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(name);
	if (i < 0) return fallback;
	const [value] = args.splice(i, 2).slice(1);
	return value;
};
const show = args.includes("--show") && args.splice(args.indexOf("--show"), 1);
const docSize = Number(flag("--doc", 10));

const vite = await createServer({
	root: ROOT,
	configFile: `${ROOT}vite.embed.config.ts`,
	server: { middlewareMode: true, hmr: false },
	appType: "custom",
	optimizeDeps: { disabled: true },
	logLevel: "error",
});
const load = (path) => vite.ssrLoadModule(path).catch(() => null);
const dictionary = await load("/src/lib/dictionary.ts");
const { parseContext, suggest } = await load("/src/lib/suggest.ts");
const rank = await load("/src/lib/rank.ts");
const session = await load("/src/lib/session.ts");

/** A fresh field: `guess(text)` answers the suggestions for `text`. */
function field() {
	if (!rank) return (text) => suggest(dictionary.search, parseContext(text));
	const memory = session ? new session.Session() : undefined;
	const lookup = rank.ranker({ ...dictionary, session: memory });
	return (text) => {
		memory?.observe(text);
		return suggest(lookup, parseContext(text));
	};
}

const OPENER = /^[^a-z0-9]+/i;
const CLOSER = /[^a-z0-9]+$/i;
const WORD = /^[a-z]+$/i;

function evaluate(docs) {
	let words = 0;
	let right1 = 0;
	let letters = 0;
	let saved = 0;
	for (const doc of docs) {
		const guess = field();
		let text = "";
		for (const token of doc.split(/\s+/).filter(Boolean)) {
			const open = token.match(OPENER)?.[0] ?? "";
			const rest = token.slice(open.length);
			const word = rest.replace(CLOSER, "");
			text += open;
			if (WORD.test(word)) {
				letters += word.length;
				if (word.length > 1) words++;
				let done = false;
				for (let k = 1; k < word.length && !done; k++) {
					const top = guess(text + word.slice(0, k))[0];
					if (top?.toLowerCase() !== word.toLowerCase()) continue;
					if (k === 1) right1++;
					saved += word.length - k - 1;
					done = true;
				}
			}
			text += rest + " ";
			guess(text);
		}
	}
	const pct = (a, b) => `${((100 * a) / b).toFixed(1)}%`;
	return { words, right1: pct(right1, words), saved: pct(saved, letters) };
}

function documents(list) {
	const docs = [];
	for (let i = 0; i < list.length; i += docSize) docs.push(list.slice(i, i + docSize).join(" "));
	return docs;
}

if (show) {
	// The first three suggestions for each phrase, in a fresh field.
	for (const phrase of args) {
		console.log(`${JSON.stringify(phrase)} → ${field()(phrase).slice(0, 3).join(", ")}`);
	}
} else {
	const corpora = [["Tatoeba held-out", (await sentences()).test.slice(0, 6000)]];
	for (const file of args) {
		const text = fs.readFileSync(file, "utf8").replace(/\s+/g, " ");
		corpora.push([file, text.split(/(?<=[.!?]["”’)]?)\s+/)]);
	}
	console.log(`corpus | words | right after 1 letter | keystrokes saved   (${docSize} sentences per document)`);
	for (const [name, list] of corpora) {
		const { words, right1, saved } = evaluate(documents(list));
		console.log(`${name} | ${words} | ${right1} | ${saved}`);
	}
}
await vite.close();
