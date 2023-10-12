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
        position: relative;
        display: flex;
        align-items: baseline;
        margin-top: 4px;
        padding: 8px 0 8px 16px;
    }

    .wrapper::after {
        content: "";
        position: absolute;
        top: 0;
        right: 8px;
        height: 100%;
        width: 16px;
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
    }

    .wrapper:not(:last-child) {
        border-bottom: 1px solid rgb(250, 250, 252);
    }

    label {
        font-family: var(--typeface-main);
        color: rgb(131, 141, 153);
    }

    .input {
        all: unset;
        width: 100%;
        padding-left: 8px;
        margin-right: 8px;
    }
</style>