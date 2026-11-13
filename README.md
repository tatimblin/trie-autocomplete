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

## embed

The app also ships as one ES module, `dist/index.js`, which [tristantimblin.dev](https://tristantimblin.dev/demo/trie-autocomplete/) loads from GitHub Pages:

```js
import { mount } from "https://tatimblin.github.io/trie-autocomplete/dist/index.js";
const { destroy } = mount(el, { assetBase }); // fills `el`; destroy() removes it
```

`npm run build:embed` builds it locally. To release, bump `version`, merge, and tag `v<version>` on main: the Pages workflow builds the page and the embed and deploys both.

## data-structures

Part of the [front-end data-structures collection](https://github.com/tatimblin/data-structures), a series of isolated examples that illustrate  computer science fundamentals in front-end development.