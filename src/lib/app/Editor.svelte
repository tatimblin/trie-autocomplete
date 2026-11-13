<script lang="ts">
	import dictionary from "$lib/dictionary";
    import Input from "./Input.svelte";
    import ControlBar from "./ControlBar.svelte";

    let input = "Hello Wor";
    let phrase = "Wor";
    let index = 0;

    function handleAppend(e: CustomEvent<string>) {
        if (e.detail) {
            input += e.detail + " ";
        } else {
            input += typeahead + " ";
        }
        phrase = "";
    }

    function handleActive(e: CustomEvent<string>) {
        index = 0;
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
    on:active={handleActive}
    on:cycle={cycleIndex}
/>
<ControlBar
    suggestion={suggestions[index]}
    enable={!!phrase.length}
    on:append={handleAppend}
    on:cycle={cycleIndex}
/>
