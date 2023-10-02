<script lang="ts">
    export let title: string;
</script>

<main class="compose">
    <nav class="nav">
        <h1>
            {title}
        </h1>
        <div>
            ctrl
        </div>
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
        padding: 4px;
        background-color: rgb(239, 240, 242);
        border-radius: 8px;
    }
</style>