<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { sanitize, setCursor } from "$lib";

    export let label: string;
    export let typeahead: string;
    export let input: string;

    let inputEl: HTMLSpanElement;

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
                if (!typeahead) break;
                event.preventDefault();
                dispatch('append', typeahead);
                setTimeout(() => setCursor(inputEl), 1);
                break;
            default:
        }
	}

    function type(event: Event) {
        console.log("input", typeahead)
        const target = event.target as HTMLSpanElement;

        if (!target.textContent) {
            return;
        }

        if (target.textContent.length === 1) {
            sanitize(target);
        }

        dispatch('active', target.textContent?.split(" ").pop() || "");
    }

    function focus() {
        inputEl.focus();
        setCursor(inputEl);
    }

    function handleClick() {
        dispatch('append', typeahead);
        setCursor(inputEl);
    }

    onMount(focus);
</script>

<div
    class="textarea-wrapper"
    role="button"
    tabindex="-1"
    on:click={focus}
    on:keydown={focus}
>
    <div
        class="textarea-label"
        id="instruction"
    >
        {label}:
    </div>
    <div
        class="textarea"
    >
        <span
            class="textarea-text"
            contenteditable="true"
            aria-labelledby="instruction"
            role="textbox"
            tabindex="0"
            bind:textContent={input}
            bind:this={inputEl}
            on:click|stopPropagation={() => {}}
            on:keydown|stopPropagation={control}
            on:input={type}
        >
            {input}
        </span>
        <span class="test"></span>
        <span
            class="textarea-after"
            contenteditable="false"
            role="button"
            tabindex="0"
            on:click={handleClick}
            on:keypress={handleClick}
        >
            {typeahead}
        </span>
    </div>
</div>

<style>
    .textarea-wrapper {
        min-height: 10em;
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
        padding: 8px 14px;
        white-space: pre-wrap;
        outline: none;
        font-size: 0;
    }

    .textarea-text {
        font-size: 12px;
    }

    .textarea-text:focus {
        outline: none;
    }

    .textarea-after {
        display: none;
        color: rgb(160, 172, 187);
        font-size: 12px;
        cursor: pointer;
    }

    .textarea:focus-within .textarea-after {
        display: inline
    }
</style>