<script lang="ts">
	import { search } from "$lib/dictionary";
	import { cycle, parseContext, suggest } from "$lib/suggest";
    import Input from "./Input.svelte";

    let input = "Hello Wor";
    let index = 0;

    function handleAppend(e: CustomEvent<string>) {
        if (e.detail) {
            input += e.detail + " ";
        } else {
            input += typeahead + " ";
        }
        index = 0;
    }

    function handleActive() {
        index = 0;
    }

    function cycleIndex(e: CustomEvent<number>) {
        index = cycle(index, e.detail, suggestions.length);
    }

    $: context = parseContext(input);
    $: suggestions = suggest(search, context);
    $: typeahead = suggestions[index]?.slice(context.partial.length) ?? "";
</script>

<Input
    label="Message"
    typeahead={typeahead}
    partial={context.partial}
    suggestions={suggestions}
    index={index}
    bind:input={input}
    on:append={handleAppend}
    on:active={handleActive}
    on:cycle={cycleIndex}
/>
