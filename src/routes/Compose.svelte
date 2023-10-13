<script lang="ts">
    import { base } from "$app/paths";

    export let title: string;

    const controls = [
        { src: "expand.png" },
        { src: "close.png" },
    ];
</script>

<main class="compose">
    <nav class="nav">
        <h1>
            {title}
        </h1>
        <ul class="controls">
            {#each controls as control}
                <li class="controls-item">
                    <img class="controls-image" src="{base}/{control.src}" alt="">
                </li>
            {/each}
        </ul>
    </nav>
    <slot />
</main>

<style>
    .nav {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 8px 4px;
    }

    .compose {
        padding: 6px;
        background-color: rgb(239, 240, 242);
        border-radius: 12px;
        border: 1px solid #fff;
        box-shadow: 0px 1px 1px 0px rgb(225, 225, 225);
    }

    .controls {
        display: flex;
        gap: 8px;
    }

    .controls-item {
        cursor: pointer;
        opacity: 0.6;
        transition: all 100ms ease;
    }

    .controls-item:hover {
        opacity: 1;
    }

    .controls-image {
        width: 12px;
        height: 12px;
    }
</style>