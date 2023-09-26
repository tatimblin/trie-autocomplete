<script lang="ts">
	import dictionary from "$lib/dictionary";
    import Input from "./Input.svelte";

    let input = "Hello W";
    let phrase = "W";
    let index = 0;

    function handleAppend(e: CustomEvent) {
        phrase = e.detail.lastWord;
    }

    function getTypeahead(suggestions: string[]): string {
        if (!phrase.length) return "";

        return suggestions[index].slice(phrase.length);
    }

    $: suggestions = dictionary.search(phrase.toLowerCase());
    $: typeahead = getTypeahead(suggestions);
</script>

<Input
    label="Compose Message"
    typeahead={typeahead}
    bind:input={input}
    on:append={handleAppend}
/>
