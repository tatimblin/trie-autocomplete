<script lang="ts">
    // Plays a short scripted demo in the field on load: it types a few
    // letters, the trie guesses the rest, and the demo accepts. It drives the
    // field the way a person would, through its DOM (text + input events,
    // Tab/PageDown keydowns, clicks on the buttons), so it needs nothing from
    // Editor. Any real tap or keypress stops it and leaves the field to the
    // person. With reduced motion it skips straight to the end.
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

    let el: HTMLElement;
    let root: HTMLElement | null = null;
    // "idle" until mounted, so the prerendered page shows neither control.
    let state: "idle" | "playing" | "done" = "idle";
    let instant = false;
    let keys: string[] = [];
    let timers = new Set<ReturnType<typeof setTimeout>>();

    function later(ms: number, fn: () => void) {
        const timer = setTimeout(() => {
            timers.delete(timer);
            fn();
        }, ms);
        timers.add(timer);
    }

    const field = () => root?.querySelector<HTMLElement>('[role="textbox"]') ?? null;
    const mouse = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

    function press(label: string) {
        keys = [...keys, label].slice(-10);
    }

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
            press(text[i] === " " ? "␣" : text[i]);
            typeOut(text, done, i + 1);
        });
    }

    function step(i = 0) {
        const next = () => later(SETTLE_MS, () => step(i + 1));
        const s = SCRIPT[i];
        if (!s) {
            state = "done";
            return;
        }
        if ("type" in s) {
            typeOut(s.type, () => step(i + 1));
        } else if ("accept" in s) {
            later(THINK_MS, () => {
                if (mouse()) {
                    key("Tab");
                    press("Tab ⇥");
                } else {
                    root?.querySelector<HTMLElement>(".accept")?.click();
                    press("tap ✓");
                }
                next();
            });
        } else if (mouse()) {
            // Walk the highlight to the pick with PgDn, then take it.
            let n = 0;
            const walk = () =>
                later(THINK_MS, () => {
                    if (n++ < s.pick) {
                        key("PageDown");
                        press("PgDn");
                        walk();
                    } else {
                        key("Tab");
                        press("Tab ⇥");
                        next();
                    }
                });
            walk();
        } else {
            later(THINK_MS, () => {
                const alt = root?.querySelectorAll<HTMLElement>(".alt")[s.pick];
                press(`tap “${alt?.textContent ?? ""}”`);
                alt?.click();
                next();
            });
        }
    }

    function play() {
        stop();
        keys = [];
        state = "playing";
        setText("");
        later(500, () => step());
    }

    function stop() {
        timers.forEach(clearTimeout);
        timers.clear();
        state = "done";
    }

    // A real tap or keypress anywhere in the demo. Capture, so it's seen
    // before the field's own key handling, and before that key lands. Not
    // for this component's own buttons: stopping on their pointerdown would
    // remove "Type yourself" before its click.
    function interrupt(event: Event) {
        if (!event.isTrusted || state !== "playing") return;
        if (event.target instanceof Node && el.contains(event.target)) return;
        stop();
    }

    // "Type yourself": the field, ready, with the caret after the text.
    function handOver() {
        stop();
        const input = field();
        if (!input) return;
        input.focus({ preventScroll: true });
        setCursor(input);
    }

    onMount(() => {
        root = el.closest<HTMLElement>(".trie-root");
        root?.addEventListener("pointerdown", interrupt, true);
        root?.addEventListener("keydown", interrupt, true);

        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            instant = true;
            setText(END);
            if (mouse()) handOver();
            return;
        }
        play();
    });

    onDestroy(() => {
        stop();
        root?.removeEventListener("pointerdown", interrupt, true);
        root?.removeEventListener("keydown", interrupt, true);
    });
</script>

<div class="autoplay" class:autoplay--instant={instant} bind:this={el}>
    {#if state === "playing"}
        <div class="bar">
            <span class="dot" aria-hidden="true"></span>
            <span class="status">Playing a demo</span>
            <button class="button button--primary" type="button" on:click={handOver}>
                Type yourself
            </button>
        </div>
        <ol class="keys" aria-hidden="true">
            {#each keys as label}
                <li class="key" class:key--accept={label.length > 1}>{label}</li>
            {/each}
        </ol>
    {:else if state === "done" && !instant}
        <div class="bar bar--done">
            <span class="turn">Your turn: keep typing.</span>
            <button class="button" type="button" on:click={play}>↻ Replay the demo</button>
        </div>
    {/if}
</div>

<style>
    /* Holds its height from playing to done, so stopping doesn't move the
       field under a finger. */
    .autoplay {
        min-height: 84px;
        margin-top: 20px;
    }

    .autoplay--instant {
        min-height: 0;
        margin: 0;
    }

    .bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 14px;
        border-radius: 12px;
        font-size: 15px;
        color: #fff;
        background-color: rgb(31, 41, 55);
    }

    .bar--done {
        flex-wrap: wrap;
        gap: 0 16px;
        padding: 0;
        color: rgb(17, 17, 17);
        background: none;
    }

    .turn {
        font-weight: 600;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: rgb(90, 209, 154);
        animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
        50% {
            opacity: 0.3;
        }
    }

    .status {
        flex: 1;
    }

    .button {
        all: unset;
        padding: 10px 14px;
        border-radius: 999px;
        font-size: 15px;
        font-weight: 600;
        color: rgb(70, 80, 94);
        cursor: pointer;
    }

    .bar--done .button {
        padding: 10px 0;
        font-weight: 500;
        text-decoration: underline dotted rgb(160, 172, 187);
        text-underline-offset: 4px;
    }

    .button--primary {
        color: rgb(17, 17, 17);
        background-color: #fff;
    }

    .button:focus-visible {
        outline: 2px solid rgb(47, 143, 98);
        outline-offset: 2px;
    }

    .keys {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        height: 30px;
        margin-top: 10px;
        overflow: hidden;
    }

    .key {
        flex: none;
        min-width: 28px;
        height: 28px;
        padding: 0 7px;
        border: 1px solid rgb(201, 208, 218);
        border-bottom-width: 2px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        line-height: 25px;
        text-align: center;
        color: rgb(51, 51, 51);
        background-color: #fff;
    }

    .key--accept {
        border-color: rgb(47, 143, 98);
        color: #fff;
        background-color: rgb(47, 143, 98);
    }
</style>
