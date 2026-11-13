// The app as an embed for tristantimblin.dev: `mount(el, { assetBase })`
// renders it into `el`, filling it, and returns `{ destroy }`. Built by
// vite.embed.config.ts into one ES module, dist/index.js, with the
// components' CSS, the scoped reset and the icons inside it. `assetBase` is
// part of the contract but unused: the bundle loads nothing of its own.
import App from "./lib/app/App.svelte";
import reset from "./lib/app/reset.css?inline";

const FONT = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";

export interface MountOptions {
	assetBase?: string;
}

export interface Handle {
	destroy(): void;
}

// The font and the reset are page-wide, so they're added once and left in
// place: a later mount reuses them.
function once(id: string, make: () => HTMLElement) {
	if (document.getElementById(id)) return;
	const node = make();
	node.id = id;
	document.head.append(node);
}

export function mount(el: HTMLElement, _opts: MountOptions = {}): Handle {
	once("trie-autocomplete-font", () =>
		Object.assign(document.createElement("link"), { rel: "stylesheet", href: FONT }),
	);
	once("trie-autocomplete-reset", () =>
		Object.assign(document.createElement("style"), { textContent: reset }),
	);

	const host = document.createElement("div");
	host.style.cssText = "height: 100%; margin: 0; overflow: auto;";
	el.append(host);
	const app = new App({ target: host });

	let live = true;
	return {
		destroy() {
			if (!live) return;
			live = false;
			app.$destroy();
			host.remove();
		},
	};
}
