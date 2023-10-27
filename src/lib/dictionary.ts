import { Trie } from "@tristimb/data-structures";
import document from "$lib/10000-common-words.txt?raw";
import { getErrorMessage } from "$lib";

const words = document.split('\n');

const dictionary = new Trie();
console.info("Initialize Trie()");

for (let i = 0; i < words.length; i++) {
    try {
        dictionary.add(words[i], i);
    } catch(err) {
        console.error(`Could not add: ${getErrorMessage(err)}`)
    }
}

export default dictionary;
