<script lang="ts">
	import { nextWords, search, words } from "$lib/dictionary";
	import { ranker } from "$lib/rank";
	import { Session } from "$lib/session";
	import { cycle, parseContext, suggest } from "$lib/suggest";
    import Input from "./Input.svelte";

    let input = "Hello Wor";
    let index = 0;

    // What's been typed here, for as long as the field is on the page.
    const session = new Session();
    const lookup = ranker({ search, words, nextWords, session });

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
    let suggestions: string[] = [];
    $: {
        // Learn the text first, so the suggestions count it.
        session.observe(input);
        suggestions = suggest(lookup, context);
    }
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
