<script lang="ts">
    import Compose from "./Compose.svelte";
    import Field from "./Field.svelte";
    import Editor from "./Editor.svelte";
    import Button from "./Button.svelte";

    let recipient = "Tristan Timblin";
    let subject = "A Trie based type-ahead and autocomplete of the 10,000 most common English words";
</script>

<div class="window">
    <div>
        <h1 class="heading">Trie Type-Ahead</h1>
    </div>
    <div class="wrapper">
        <Compose title="New Message">
            <div class="compose-body">
                <Field label="To" id="to" value={recipient} />
                <Field label="Subject" id="recipient" value={subject} />
                <Editor />
                <ul class="compose-actions">
                    <li class="compose-actions-item">
                        <Button label="Save as draft" />
                    </li>
                    <li class="compose-actions-item">
                        <Button label="Send" primary={true} />
                    </li>
                </ul>
            </div>
        </Compose>
    </div>
    <p class="footer">
        <span>Part of a <a href="https://github.com/tatimblin/data-structures#contents" target="_blank">front-end with data-structures demos</a> collection</span>
        <span>•</span>
        <span>Built in <a href="https://g.co/kgs/1eP9TL" target="_blank">Kiawah Island, SC</a></span>
    </p>
</div>

<style>
    .window {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100dvh;
        padding: 0 4px;
        background-color: rgb(239, 243, 250);
    }

    @media screen and (min-width: 600px) {
        .window {
            padding: 0;
        }
    }

    .heading {
        font-size: 24px;
        font-weight: 600;
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

    .compose-actions {
        display: flex;
        justify-content: space-between;
        gap: 32px;
        padding: 16px;
    }

    .footer {
        text-align: center;
        line-height: 1.5em;
    }
</style>