# trie-autocomplete

<p align="center">
    <img src="screenshot.png" width="500px" />
</p>

[Try it live](https://tatimblin.github.io/trie-autocomplete/)

An implementation of a suggest-as-you-go typing experience found in many WYSIWYG editors. The words are stored in a Trie, a tree based data-structure which optimizes the search by ignoring non-matching words.

## usage

1. Begin typing to see the rest of the word in light grey.
2. Press `Tab`, or tap/click the grey letters or the green button after them, to accept it.
3. The line below lists other suggestions: tap/click one to accept it, or use `PageUp`/`PageDown` to move the highlight (and the grey letters) through them.

## guessing

The trie finds the words that start with what you've typed. They're ranked by how common each word is, which word usually comes after the one before it, and the words you've already typed in the field (`src/lib/rank.ts`). `node scripts/eval-guesses.mjs` measures how often the first suggestion is right; `node scripts/build-next-words.mjs` rebuilds the next-word table.

## embed

The app also ships as one ES module, `dist/index.js`, which [tristantimblin.dev](https://tristantimblin.dev/demo/trie-autocomplete/) loads from GitHub Pages:

```js
import { mount } from "https://tatimblin.github.io/trie-autocomplete/dist/index.js";
const { destroy } = mount(el, { assetBase }); // fills `el`; destroy() removes it
```

`npm run build:embed` builds it locally. To release, bump `version`, merge, and tag `v<version>` on main: the Pages workflow builds the page and the embed and deploys both.

## data-structures

Part of the [front-end data-structures collection](https://github.com/tatimblin/data-structures), a series of isolated examples that illustrate  computer science fundamentals in front-end development.

## credits

The next-word table, `src/lib/data/next-words.txt`, is counted from the English sentences of [Tatoeba](https://tatoeba.org), licensed [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/). See [NOTICE](NOTICE).