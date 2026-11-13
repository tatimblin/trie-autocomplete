import { Trie } from "@tristimb/data-structures";
import document from "$lib/10000-common-words.txt?raw";
import { getErrorMessage } from "$lib";

// The list repeats a few words (color, favorite, …); the Trie rejects repeats.
const words = [...new Set(document.split('\n'))];

const dictionary = new Trie();

for (let i = 0; i < words.length; i++) {
    try {
        dictionary.add(words[i], i);
    } catch(err) {
        console.error(`Could not add: ${getErrorMessage(err)}`)
    }
}

export default dictionary;
