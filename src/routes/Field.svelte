<script lang="ts">
    export let label: string;
    export let id: string;
    export let value: string;
</script>

<div class="wrapper">
    <label class="label" for={id}>{label}:</label>
    <input class="input" id={id} type="text" bind:value={value} />
</div>

<style>
    .wrapper {
        display: flex;
        align-items: baseline;
        margin: 4px 0;
        padding: 8px 16px;
    }

    .wrapper:not(:last-child) {
        border-bottom: 1px solid rgb(250, 250, 252);
    }

    label {
        font-family: var(--typeface-main);
        color: rgb(87, 95, 104);
    }

    .input {
        all: unset;
        width: 100%;
        padding: 0 8px;
    }
</style>