<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { sanitize } from "$lib";

    export let label: string;
    export let typeahead: string;
    export let input: string;

    let inputEl: HTMLDivElement;

    const dispatch = createEventDispatcher();

	function control(event: KeyboardEvent) {
        switch (event.code) {
            case "PageUp":
                dispatch('cycle', 1);
                break;
            case "PageDown":
                dispatch('cycle', -1);
                break;
            case "Tab":
                event.preventDefault();
                dispatch('approve', typeahead);
                break;
            default:
        }
	}

    function type(event: Event) {
        const target = event.target as HTMLDivElement;

        if (!target.textContent) {
            return;
        }

        if (target.textContent.length === 1) {
            sanitize(target);
        }

        dispatch('append', target.textContent?.split(" ").pop() || "");
    }

    function focus() {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(inputEl.childNodes[0], input.length);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        inputEl.focus();
    }
</script>

<div class="textarea-wrapper">
    <div
        class="textarea-label"
        id="instruction"
        on:click={focus}
        on:keydown={focus}
        role="button"
        tabindex="-1"
    >
        {label}:
    </div>
    <div
        class="textarea"
        contenteditable="true"
        role="textbox"
        tabindex="-1"
        aria-labelledby="instruction"
        data-typeahead="{typeahead}"
        bind:this={inputEl}
        bind:textContent={input}
        on:keydown={control}
        on:input={type}
    >
        {input}
    </div>
</div>

<style>
    .textarea-wrapper {
        border: 2px dashed transparent;
    }

    .textarea-wrapper:focus-within {
        border: 2px dashed rgb(105, 190, 148);
    }

    .textarea-label {
        padding: 12px 14px 8px;
        color: rgb(131, 141, 153);
    }

    .textarea {
        display: block;
        min-height: 6em;
        padding: 8px 14px;
        white-space: pre-wrap;
    }

    .textarea:focus {
        outline: none;
    }

    .textarea:focus::after {
        content: attr(data-typeahead);
        color: rgb(160, 172, 187);
    }
</style>