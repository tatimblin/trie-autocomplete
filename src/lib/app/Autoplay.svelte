<script lang="ts">
    // Plays a short demo in the field on load: it types a sentence a letter
    // at a time and, after every letter, looks at the suggestions. As soon as
    // the word it's typing is among them, it takes it: the gray one with Tab
    // (or the green button on a phone), another one with PgDn then Tab (or a
    // tap on it). A word that never shows up is typed out. It has no UI of
    // its own; it drives the field the way a person would, through its DOM
    // (text + input events, Tab/PageDown keydowns, clicks on the buttons), so
    // it needs nothing from Editor and follows whatever the suggestions are.
    // A real tap or keypress stops it: a tap on the sentence hands the field
    // over with the caret at the end, a key types, and a tap on a suggestion
    // does what it always does. With reduced motion it skips straight to the
    // end.
    import { onDestroy, onMount, tick } from "svelte";
    import { setCursor } from "$lib";

    // What the demo writes. The last word stops half-typed, as soon as it's
    // the gray suggestion, and is left for the reader to take. Most words
    // here are guessed from their first letter and the word before.
    const SENTENCE = "I want to go to New York";

    const KEY_MS = 130;
    const THINK_MS = 650;
    const STEP_MS = 300;
    const SETTLE_MS = 350;

    let marker: HTMLElement;
    let root: HTMLElement | null = null;
    let playing = false;
    let reduced = false;
    // Set when a tap on the sentence stopped the demo: its click then puts
    // the caret at the end, where the reader carries on.
    let handOver = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    function later(ms: number, fn: () => void) {
        const timer = setTimeout(() => {
            timers.delete(timer);
            fn();
        }, ms);
        timers.add(timer);
    }

    // Waits, then answers whether to carry on. stop() clears the timers, so
    // a stopped demo's wait never ends. With reduced motion it only waits for
    // the field to update, so the demo reaches its end before anything paints.
    async function pause(ms: number) {
        if (reduced) await tick();
        else await new Promise<void>((resolve) => later(ms, resolve));
        return playing;
    }

    const field = () => root?.querySelector<HTMLElement>('[role="textbox"]') ?? null;
    const mouse = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

    function setText(text: string) {
        const input = field();
        if (!input) return;
        input.textContent = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        if (document.activeElement === input) setCursor(input);
    }

    function type(text: string) {
        setText((field()?.textContent ?? "") + text);
    }

    function key(code: string) {
        field()?.dispatchEvent(
            new KeyboardEvent("keydown", { code, key: code, bubbles: true, cancelable: true }),
        );
    }

    // The suggestions on show; the first is the gray one.
    const shown = () => [...(root?.querySelectorAll<HTMLElement>(".alt") ?? [])];

    function find(word: string) {
        const wanted = word.toLowerCase();
        return shown().findIndex((alt) => alt.textContent?.toLowerCase() === wanted);
    }

    // Takes the suggestion at `index`, the way a person would.
    async function choose(index: number) {
        if (!(await pause(THINK_MS))) return false;
        if (mouse()) {
            for (let n = 0; n < index; n++) {
                key("PageDown");
                if (!(await pause(STEP_MS))) return false;
            }
            key("Tab");
        } else if (index === 0) {
            root?.querySelector<HTMLElement>(".accept")?.click();
        } else {
            shown()[index]?.click();
        }
        return pause(SETTLE_MS);
    }

    // Types `word` until it's suggested, then takes it (or, for the last
    // word, stops once it's the gray one). Answers whether to carry on.
    async function write(word: string, last: boolean) {
        for (let k = 1; k <= word.length; k++) {
            if (!(await pause(KEY_MS + (k % 3) * 40))) return false;
            type(word[k - 1]);
            // Typed out: there's nothing left to suggest.
            if (k === word.length) break;
            if (!(await pause(0))) return false;
            const index = find(word);
            if (last && index === 0) return false;
            if (!last && index >= 0) return choose(index);
        }
        if (last) return false;
        if (!(await pause(KEY_MS))) return false;
        type(" ");
        return true;
    }

    async function play() {
        const words = SENTENCE.split(" ");
        for (const [i, word] of words.entries()) {
            if (!(await write(word, i === words.length - 1))) break;
        }
        playing = false;
    }

    function stop() {
        timers.forEach(clearTimeout);
        timers.clear();
        playing = false;
    }

    // A real tap or keypress in the demo. Capture, so it's seen before the
    // field's own handling, and before that key lands.
    function interrupt(event: Event) {
        if (!event.isTrusted || !playing) return;
        stop();
        const target = event.target as Element | null;
        handOver = event.type === "pointerdown" && !!target?.closest?.(".field");
    }

    // The click after a tap on the sentence, by when the browser has put the
    // caret where the tap landed: move it to the end of the text. Capture,
    // because the field stops its clicks from bubbling.
    function caretToEnd(event: Event) {
        if (!handOver || !event.isTrusted) return;
        handOver = false;
        ready();
    }

    function ready() {
        const input = field();
        if (!input) return;
        input.focus({ preventScroll: true });
        setCursor(input);
    }

    onMount(() => {
        root = marker.closest<HTMLElement>(".trie-root");
        root?.addEventListener("pointerdown", interrupt, true);
        root?.addEventListener("keydown", interrupt, true);
        root?.addEventListener("click", caretToEnd, true);

        playing = true;
        setText("");
        reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            // Ready to type with a keyboard; a phone waits for its tap.
            play().then(() => {
                if (mouse()) ready();
            });
        } else {
            later(500, play);
        }
    });

    onDestroy(() => {
        stop();
        root?.removeEventListener("pointerdown", interrupt, true);
        root?.removeEventListener("keydown", interrupt, true);
        root?.removeEventListener("click", caretToEnd, true);
    });
</script>

<!-- Renders nothing; it only marks where the app's root is. -->
<span hidden bind:this={marker}></span>
