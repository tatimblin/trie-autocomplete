<script lang="ts">
    import { createEventDispatcher, onMount, tick } from 'svelte';
    import { sanitize, setCursor } from "$lib";

    export let label: string;
    export let typeahead: string;
    export let input: string;
    /** The word being typed, as typed. */
    export let partial = "";
    /** Whole words completing `partial`, best first; `index` is the one in gray. */
    export let suggestions: string[] = [];
    export let index = 0;

    /** How many suggestions the "or" line shows at a time. */
    const PAGE = 5;

    let inputEl: HTMLSpanElement;

    const dispatch = createEventDispatcher();

    // The page of suggestions holding the highlighted one, so PgUp/PgDn walk
    // through every suggestion a page at a time.
    $: start = Math.floor(index / PAGE) * PAGE;
    $: shown = suggestions.slice(start, start + PAGE);
    $: more = suggestions.length > start + PAGE;

    // A suggestion spelled the way the user started it: "Wor" + "ld".
    function spell(word: string) {
        return partial + word.slice(partial.length);
    }

    function control(event: KeyboardEvent) {
        switch (event.code) {
            case "PageUp":
                event.preventDefault();
                dispatch('cycle', -1);
                break;
            case "PageDown":
                event.preventDefault();
                dispatch('cycle', 1);
                break;
            case "Tab":
                if (!typeahead) break;
                event.preventDefault();
                accept(typeahead);
                break;
            default:
        }
    }

    function type(event: Event) {
        const target = event.target as HTMLSpanElement;
        const text = target.textContent ?? "";

        if (text.length === 1) {
            sanitize(target);
        }

        // \s also splits on the non-breaking spaces contenteditable inserts
        // and on newlines.
        dispatch('active', text.split(/\s/).pop() || "");
    }

    function focus() {
        inputEl.focus({ preventScroll: true });
        setCursor(inputEl);
    }

    // Adds `rest` to the word being typed, then puts the caret back after it.
    // The buttons that call this cancel pointerdown/mousedown, so the field
    // keeps focus and a phone keeps its keyboard up; focus() is the fallback
    // for a browser that moved focus anyway.
    async function accept(rest: string) {
        dispatch('append', rest);
        await tick();
        if (document.activeElement !== inputEl) inputEl.focus({ preventScroll: true });
        setCursor(inputEl);
    }

    onMount(focus);
</script>

<!-- A click on the empty part of the field focuses it; the keyboard reaches
     the field itself, so this needs no key handler of its own. -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="field" role="presentation" on:click={focus}>
    <p class="text">
        <span
            class="text-input"
            contenteditable="true"
            role="textbox"
            tabindex="0"
            aria-label={label}
            aria-multiline="true"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            bind:textContent={input}
            bind:this={inputEl}
            on:click|stopPropagation
            on:keydown|stopPropagation={control}
            on:input={type}
        >
            {input}
        </span><span class="tail"
            ><span
                class="ghost"
                aria-hidden="true"
                on:pointerdown|preventDefault
                on:mousedown|preventDefault
                on:click|stopPropagation={() => accept(typeahead)}
            >{typeahead}</span
            >{#if typeahead}<button
                    class="accept"
                    type="button"
                    aria-label={`Accept “${spell(suggestions[index] ?? "")}”`}
                    on:pointerdown|preventDefault
                    on:mousedown|preventDefault
                    on:click|stopPropagation={() => accept(typeahead)}
                ><span class="touch">tap ✓</span><span class="keys">Tab ⇥</span></button
            >{/if}</span
        >
    </p>
</div>

<div class="alts">
    {#if shown.length}
        <span class="alts-label">
            <span class="touch">or tap</span>
            <span class="keys"><kbd>PgUp</kbd> <kbd>PgDn</kbd></span>
        </span>
        <ul class="alts-list">
            {#each shown as word, i (word)}
                <li>
                    <button
                        class="alt"
                        class:alt--active={start + i === index}
                        type="button"
                        on:pointerdown|preventDefault
                        on:mousedown|preventDefault
                        on:click={() => accept(word.slice(partial.length))}
                    >{spell(word)}</button>
                </li>
            {/each}
            {#if more}<li class="alts-more" aria-hidden="true">…</li>{/if}
        </ul>
    {:else}
        <span class="alts-label">Start a word to see suggestions.</span>
    {/if}
</div>

<style>
    .field {
        min-height: 1.35em;
        cursor: text;
        font-size: 32px;
    }

    .text {
        /* The spans sit flush: no whitespace between them may render. */
        font-size: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    .text-input,
    .ghost {
        font-size: 32px;
        line-height: 1.35;
        font-weight: 500;
        letter-spacing: -0.01em;
    }

    .text-input {
        outline: none;
        caret-color: rgb(47, 143, 98);
    }

    /* The rest of the word and its button break onto a new line together:
       there's no break between typed letters and the gray ones, and none
       inside the tail. */
    .tail {
        font-size: 32px;
        white-space: nowrap;
    }

    .ghost {
        color: rgb(170, 181, 196);
        cursor: pointer;
    }

    .accept {
        all: unset;
        display: inline-block;
        margin-left: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        vertical-align: middle;
        font-size: 15px;
        font-weight: 600;
        line-height: 1;
        color: #fff;
        background-color: rgb(47, 143, 98);
        cursor: pointer;
    }

    .accept:hover {
        background-color: rgb(36, 120, 81);
    }

    .accept:focus-visible,
    .alt:focus-visible {
        outline: 2px solid rgb(47, 143, 98);
        outline-offset: 2px;
    }

    .alts {
        display: flex;
        align-items: baseline;
        gap: 4px 10px;
        min-height: 44px;
        margin-top: 16px;
        font-size: 16px;
        line-height: 1.5;
        color: rgb(120, 131, 146);
    }

    .alts-label {
        flex: none;
    }

    .alts-list {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 2px 4px;
    }

    .alt {
        all: unset;
        padding: 8px 6px;
        border-radius: 6px;
        color: rgb(70, 80, 94);
        text-decoration: underline dotted rgb(160, 172, 187);
        text-underline-offset: 4px;
        cursor: pointer;
    }

    .alt:hover {
        color: #000;
    }

    .alt--active {
        color: rgb(31, 111, 74);
        background-color: rgb(231, 245, 238);
        text-decoration: none;
    }

    .alts-more {
        padding: 6px 2px;
    }

    kbd {
        display: inline-block;
        padding: 2px 5px;
        border: 1px solid rgb(201, 208, 218);
        border-bottom-width: 2px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.2;
        color: rgb(95, 104, 117);
        background-color: #fff;
    }

    /* Touch screens get "tap"; a mouse and keyboard get the keys. */
    .keys {
        display: none;
    }

    @media (hover: hover) and (pointer: fine) {
        /* Fingertip-sized buttons by default, smaller under a mouse. */
        .accept {
            padding: 6px 12px;
            font-size: 14px;
        }

        .alt {
            padding: 6px;
        }

        .keys {
            display: inline;
        }

        .touch {
            display: none;
        }
    }

    @media (min-width: 600px) {
        .field,
        .text-input,
        .ghost,
        .tail {
            font-size: 44px;
        }
    }
</style>
