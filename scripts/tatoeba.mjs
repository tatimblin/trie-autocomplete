// Tatoeba's English sentences (CC BY 2.0 FR, https://tatoeba.org), shared by
// build-next-words.mjs and eval-guesses.mjs. The export is downloaded once
// into .cache/ (git-ignored). Every 20th sentence is held out: the bigram
// table is built from the rest, and the evaluation types the held-out ones.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const URL_ = "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2";
export const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CACHE = `${ROOT}.cache`;
const FILE = `${CACHE}/eng_sentences.tsv`;

/** The export's path, downloading and unpacking it first if it's missing. */
export async function download() {
	if (fs.existsSync(FILE)) return FILE;
	fs.mkdirSync(CACHE, { recursive: true });
	console.error(`downloading ${URL_}`);
	const res = await fetch(URL_);
	if (!res.ok) throw new Error(`${URL_}: ${res.status}`);
	fs.writeFileSync(`${FILE}.bz2`, Buffer.from(await res.arrayBuffer()));
	execFileSync("bunzip2", ["-f", `${FILE}.bz2`]);
	return FILE;
}

/** The sentences, split into the training set and the held-out set. */
export async function sentences(path) {
	const lines = fs.readFileSync(path ?? (await download()), "utf8").split("\n");
	const train = [];
	const test = [];
	lines.forEach((line, i) => {
		const sentence = line.split("\t")[2];
		if (sentence) (i % 20 === 0 ? test : train).push(sentence);
	});
	return { train, test };
}
