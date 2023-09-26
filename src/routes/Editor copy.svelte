<script lang="ts">
    import Dictionary from "$lib/dictionary";
    import Input from "./Input.svelte";

    let input = "Hello W";
    let index = 0;

    function getCurrentWord(phrase = ""): string {
        return phrase.trim().split(" ").pop() || "";
    }

    function getTypeahead(suggestions: string[] = [], index = 0): string {
        if (!suggestions.length) {
            return "";
        }
        return suggestions[index].slice(currentWord.length);
    }

    function watchKeyboard({ code }: { code: string }) {
        switch (code) {
            case "ArrowDown":
                index = index < suggestions.length - 1 ? index + 1 : 0;
                break;
            case "ArrowRight":
                input += typeahead;
                currentWord = "";
            default:
                index = 0;
                break;
        }
    }

    $: currentWord = getCurrentWord(input);
    $: suggestions = Dictionary.search(currentWord.toLowerCase());
    $: typeahead = getTypeahead(suggestions, index);
</script>

<Input
    label="Compose Message"
    typeahead={typeahead}
    bind:input={input}
/>
