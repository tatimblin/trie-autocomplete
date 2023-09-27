<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { sanitize } from "$lib";

    export let label: string;
    export let typeahead: string;
    export let input: string;

    const dispatch = createEventDispatcher();

	function control(event: KeyboardEvent) {
        switch (event.code) {
            case "PageUp":
            case "PageDown":
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

        dispatch('append', {
            lastWord: target.textContent?.split(" ").pop() || "",
        });
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
    on:keydown={control}
    on:input={type}
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