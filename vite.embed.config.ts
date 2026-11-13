// The embed build: src/embed.ts → dist/index.js, one ES module with
// everything inside (library mode inlines every asset; the components inject
// their own CSS). `npm run build:embed`. The Pages workflow builds it on each
// v* tag and serves it at https://tatimblin.github.io/trie-autocomplete/dist/index.js
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		svelte({
			preprocess: vitePreprocess(),
			compilerOptions: { css: "injected" },
			emitCss: false,
		}),
	],
	resolve: {
		alias: { $lib: fileURLToPath(new URL("./src/lib", import.meta.url)) },
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		lib: {
			entry: "src/embed.ts",
			formats: ["es"],
			fileName: () => "index.js",
		},
	},
});
