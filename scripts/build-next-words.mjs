// Builds src/lib/data/next-words.txt, the words most likely to follow a
// word, from Tatoeba's English sentences (CC BY 2.0 FR, see NOTICE).
//
//   node scripts/build-next-words.mjs [eng_sentences.tsv]
//
// Run by hand, offline from the build: it downloads the export into .cache/
// unless given a copy. It counts pairs of words with nothing but a space
// between them, both from the word list ("<s>" stands for the start of a
// sentence), over all sentences but the held-out ones eval-guesses.mjs
// types. It keeps the 500 most common first words and, for each, its 10 most
// common followers seen at least 3 times. Each line of the output is a word
// then its followers, most common first: `new york car job …`.
import fs from "node:fs";
import { ROOT, sentences } from "./tatoeba.mjs";

const PRIORS = 500;
const NEXT = 10;
const MIN_COUNT = 3;
const START = "<s>";
// Tatoeba's stock names turn up in a large share of its sentences.
const STOCK = new Set(["tom", "mary", "john", "boston", "alice"]);

// The word list as src/lib/words.ts reads it.
const vocab = new Set();
for (const line of fs.readFileSync(`${ROOT}src/lib/10000-common-words.txt`, "utf8").split("\n")) {
	const word = line.trim().toLowerCase();
	if (word && (word.length > 1 || word === "a" || word === "i")) vocab.add(word);
}

// A sentence's runs of words with nothing but spaces between them; the
// first run starts with START. Apostrophes stay inside words, so "don't" is
// one word, outside the list, as it is in the field.
function runs(sentence) {
	return sentence
		.toLowerCase()
		.replace(/[‘’]/g, "'")
		.split(/[^a-z'\s]+/)
		.map((chunk, i) => {
			const words = chunk.split(/\s+/).filter(Boolean);
			return i === 0 ? [START, ...words] : words;
		});
}

const { train } = await sentences(process.argv[2]);
const totals = new Map();
const pairs = new Map();
for (const sentence of train) {
	for (const run of runs(sentence)) {
		for (let i = 1; i < run.length; i++) {
			const [prior, word] = [run[i - 1], run[i]];
			if (prior !== START && (!vocab.has(prior) || STOCK.has(prior))) continue;
			totals.set(prior, (totals.get(prior) ?? 0) + 1);
			if (!vocab.has(word) || STOCK.has(word)) continue;
			const next = pairs.get(prior) ?? new Map();
			pairs.set(prior, next.set(word, (next.get(word) ?? 0) + 1));
		}
	}
}

const lines = [];
const byCount = (a, b) => b[1] - a[1];
for (const [prior] of [...totals].sort(byCount).slice(0, PRIORS)) {
	const next = [...(pairs.get(prior) ?? [])].filter(([, count]) => count >= MIN_COUNT).sort(byCount);
	if (next.length) lines.push([prior, ...next.slice(0, NEXT).map(([word]) => word)].join(" "));
}
fs.mkdirSync(`${ROOT}src/lib/data`, { recursive: true });
fs.writeFileSync(`${ROOT}src/lib/data/next-words.txt`, lines.join("\n") + "\n");
console.log(`${lines.length} words, ${lines.reduce((n, line) => n + line.split(" ").length - 1, 0)} followers`);
