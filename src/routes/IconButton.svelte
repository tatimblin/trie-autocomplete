<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let icon: string;

    const dispatch = createEventDispatcher();

    function handleClick(event: MouseEvent) {
        dispatch("click", event)
    }
</script>

<button class="IconButton" on:click={handleClick}>
    <img src="{icon}.png" alt={icon} class="IconButton-img">
</button>

<style>
    .IconButton {
        all: unset;
        padding: 2px;
        opacity: 0.33;
        border: 1px solid transparent;
        border-radius: 3px;
        transition: all 150ms ease;
        cursor: pointer;
    }

    .IconButton:hover {
        opacity: 0.66;
        border-color: rgb(202, 202, 202);
        background-color: #fefefe;
    }

    .IconButton-img {
        width: 16px;
        height: 16px;
    }
</style>