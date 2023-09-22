<script lang="ts">
    import Dictionary from "$lib/dictionary";

    let input = "Hello W";

    function getCurrentWord(phrase: string): string {
        return phrase.trim().split(" ").pop() || "";
    }

    function getTypeahead(suggestions: string[] = [], pop: number = 0): string {
        if (!suggestions.length) {
            return "";
        }

        return suggestions[0].slice(pop);
    }

    function realizeTypeahead() {
        input += typeahead;
        currentWord = "";
    }

    $: currentWord = getCurrentWord(input);
    $: suggestions = Dictionary.search(currentWord.toLowerCase());
    $: typeahead = getTypeahead(suggestions, currentWord.length);
</script>

<div
    class="textarea"
    contenteditable="true"
    data-typeahead="{typeahead}"
    bind:innerHTML={input}
>
    {input}
</div>
<button on:click={realizeTypeahead}>
    Select
</button>

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
