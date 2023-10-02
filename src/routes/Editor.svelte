<script lang="ts">
	import dictionary from "$lib/dictionary";
    import Input from "./Input.svelte";

    let input = "Hello W";
    let phrase = "W";
    let index = 0;

    function handleAppend(e: CustomEvent<string>) {
        index = 0;
        console.log(e)
        phrase = e.detail;
    }

    function cycleIndex(e: CustomEvent<number>) {
        let result = index + e.detail;

        if (result < 0) {
            result = suggestions.length + result;
        }

        if (result > suggestions.length - 1) {
            result = result - suggestions.length;
        }
        
        index = result;
    }

    function getTypeahead(suggestions: string[], index = 0): string {
        if (!phrase.length) return "";

        return suggestions[index]?.slice(phrase.length) || "";
    }

    $: suggestions = dictionary.search(phrase.toLowerCase());
    $: typeahead = getTypeahead(suggestions, index);
</script>

<Input
    label="Body"
    typeahead={typeahead}
    bind:input={input}
    on:append={handleAppend}
    on:cycle={cycleIndex}
/>
