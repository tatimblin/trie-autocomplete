<script lang="ts">
    // Plays a short scripted demo in the field on load: it types a few
    // letters, the trie guesses the rest, and the demo accepts. It has no UI
    // of its own; it drives the field the way a person would, through its DOM
    // (text + input events, Tab/PageDown keydowns, clicks on the buttons), so
    // it needs nothing from Editor. A real tap or keypress stops it: a tap on
    // the sentence hands the field over with the caret at the end, a key
    // types, and a tap on a suggestion does what it always does. With reduced
    // motion it skips straight to the end.
    import { onDestroy, onMount } from "svelte";
    import { setCursor } from "$lib";

    type Step =
        | { type: string }
        // Take the gray suggestion.
        | { accept: true }
        // Take the nth suggestion instead (0 is the gray one).
        | { pick: number };

    // Written against the ranked suggestions of feat/rank-suggestions: each
    // accepted word is the top suggestion for its letters, and "work" is the
    // second for "wor", after "world".
    const SCRIPT: Step[] = [
        { type: "Pe" }, { accept: true },
        { type: "li" }, { accept: true },
        { type: "th" }, { accept: true },
        { type: "gre" }, { accept: true },
        { type: "wor" }, { pick: 1 },
        { type: "on " },
        { type: "thi" }, { accept: true },
        { type: "proj" },
    ];
    // Where the script ends: a word left half-typed, its rest in gray.
    const END = "People like the great work on this proj";

    const KEY_MS = 130;
    const THINK_MS = 650;
    const SETTLE_MS = 350;

    let marker: HTMLElement;
    let root: HTMLElement | null = null;
    let playing = false;
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

    const field = () => root?.querySelector<HTMLElement>('[role="textbox"]') ?? null;
    const mouse = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

    function setText(text: string) {
        const input = field();
        if (!input) return;
        input.textContent = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        if (document.activeElement === input) setCursor(input);
    }

    function key(code: string) {
        field()?.dispatchEvent(
            new KeyboardEvent("keydown", { code, key: code, bubbles: true, cancelable: true }),
        );
    }

    function typeOut(text: string, done: () => void, i = 0) {
        if (i >= text.length) return done();
        later(KEY_MS + (i % 3) * 40, () => {
            setText((field()?.textContent ?? "") + text[i]);
            typeOut(text, done, i + 1);
        });
    }

    function step(i = 0) {
        const next = () => later(SETTLE_MS, () => step(i + 1));
        const s = SCRIPT[i];
        if (!s) {
            playing = false;
            return;
        }
        if ("type" in s) {
            typeOut(s.type, () => step(i + 1));
        } else if ("accept" in s) {
            later(THINK_MS, () => {
                if (mouse()) key("Tab");
                else root?.querySelector<HTMLElement>(".accept")?.click();
                next();
            });
        } else if (mouse()) {
            // Walk the highlight to the pick with PgDn, then take it.
            let n = 0;
            const walk = () =>
                later(THINK_MS, () => {
                    if (n++ < s.pick) {
                        key("PageDown");
                        walk();
                    } else {
                        key("Tab");
                        next();
                    }
                });
            walk();
        } else {
            later(THINK_MS, () => {
                root?.querySelectorAll<HTMLElement>(".alt")[s.pick]?.click();
                next();
            });
        }
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

        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setText(END);
            // Ready to type with a keyboard; a phone waits for its tap.
            if (mouse()) ready();
            return;
        }
        playing = true;
        setText("");
        later(500, () => step());
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
