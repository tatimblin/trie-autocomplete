<script lang="ts">
    import Compose from "./Compose.svelte";
    import Field from "./Field.svelte";
    import Editor from "./Editor.svelte";

    let recipient = "";
    let subject = "";
</script>

<div class="window">
    <div class="wrapper">
        <Compose title="New Message">
            <div class="compose-body">
                <Field label="To" id="to" value={recipient} />
                <Field label="Subject" id="recipient" value={subject} />
                <Editor />
            </div>
        </Compose>
    </div>
</div>

<style>
    .window {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100dvh;
    }
    .wrapper {
        width: 100%;
        max-width: 600px;
        margin: 32px 8px;
    }

    .compose-body {
        padding-top: 2px;
        border-radius: 7px;
        background-color: #fff;
    }
</style>