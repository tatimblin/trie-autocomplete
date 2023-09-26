<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let label: string;
    export let typeahead: string;
    export let input: string;

    const dispatch = createEventDispatcher();

	function watch(event: KeyboardEvent) {
        switch (event.code) {
            case "PageUp":
            case "PageDown":
            default:
                dispatch('append', {
                    lastWord: input.split(" ").pop() || "",
                });
        }
	}
</script>

<p id="instruction">{label}</p>
<div
    class="textarea"
    contenteditable="true"
    role="textbox"
    tabindex="-1"
    aria-labelledby="instruction"
    data-typeahead="{typeahead}"
    bind:textContent={input}
    on:keydown={watch}
>
    {input}
</div>

<style>
    .textarea {
        display: block;
        padding: 16px 8px;
        border: 1px solid #c6c6c6;
        border-radius: 3px;
        white-space: pre-wrap;
    }

    .textarea::after {
        content: attr(data-typeahead);
        color: #c6c6c6;
    }
    
</style>