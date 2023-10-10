<script lang="ts">
    export let label: string;
    export let primary: boolean = false;
</script>

<button class={`button ${primary ? "button--primary" : "button--secondary"}`}>
    {label}
</button>

<style>
    .button {
        display: inline-block;
        all: unset;
        padding: 8px 16px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 300ms ease;
    }

    .button--primary {
        color: #fff;
        border: 1px solid rgb(105, 190, 148);
        outline: rgb(79, 157, 119) solid 1px;
        background-color: rgb(90, 182, 136);
    }

    .button--primary:hover {
        background-color: rgb(79, 167, 123);
    }

    .button--secondary {
        border: 1px solid #fff;
        outline: rgb(235, 236, 238) solid 1px;
        background-color: #fff;
    }

    .button--secondary:hover {
        background-color: #f3f3f3;
    }
</style>