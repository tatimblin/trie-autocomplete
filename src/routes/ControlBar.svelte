<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import IconButton from "./IconButton.svelte";

    export let suggestion: string;
    export let enable: boolean;

    const dispatch = createEventDispatcher();

    const icons = ["bold", "align", "link", "attach"];
</script>

<div class="ControlBar">
    <ul class="ControlBar-buttonList">
        {#each icons as icon}
            <li class="ControlBar-button">
                <IconButton icon={icon} />
            </li>
        {/each}
    </ul>
    {#if enable}
        <div class="ControlBar-cycle">
            <IconButton icon="chevron-left" on:click={() => dispatch("cycle", -1)} />
            <span class="ControlBar-suggest"
                role="button"
                tabindex="0"
                on:click={() => dispatch("append")}
                on:keydown={() => dispatch("append")}
            >
                {suggestion}
            </span>
            <IconButton icon="chevron-right" on:click={() => dispatch("cycle", 1)} />
        </div>
    {/if}
</div>

<style>
    .ControlBar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        border-top: 1px solid rgb(250, 250, 252);
        border-bottom: 1px solid rgb(250, 250, 252);
    }

    .ControlBar-buttonList, .ControlBar-cycle {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .ControlBar-suggest {
        min-width: 75px;
        text-align: center;
        color: #adadad;
        transition: all 150ms ease;
        cursor: pointer;
    }

    .ControlBar-suggest:hover {
        color: #000;
    }
</style>