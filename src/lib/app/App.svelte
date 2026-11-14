<script lang="ts">
    import Autoplay from "./Autoplay.svelte";
    import Editor from "./Editor.svelte";
</script>

<div class="trie-root window">
    <main class="column">
        <h1 class="title">Trie type-ahead</h1>
        <p class="lead">
            Each letter walks one node down a trie of the 10,000 most common
            English words; every word below that node is a candidate. Candidates
            are ranked by word frequency, by how often they follow the previous
            word (a 500-word bigram table from Tatoeba), and by the words already
            typed on the page. The top one is the faded completion.
        </p>
        <Autoplay />
        <div class="editor">
            <Editor />
        </div>
        <p class="footer">
            Part of a <a href="https://github.com/tatimblin/data-structures#contents" target="_blank" rel="noreferrer">front-end data-structures demos</a> collection.
        </p>
    </main>
</div>

<style>
    /* The top padding leaves room for the info card tristantimblin.dev lays
       over the embed's top-left corner: a title bar on phones, a ~350×190 card
       on wider screens. */
    .window {
        min-height: 100%;
        padding: 72px 20px 32px;
        background-color: #fff;
    }

    .column {
        display: flex;
        flex-direction: column;
        max-width: 860px;
        margin: 0 auto;
    }

    .title {
        font-size: 20px;
        font-weight: 600;
        line-height: 1.3;
    }

    .lead {
        margin-top: 6px;
        font-size: 15px;
        line-height: 1.45;
        color: rgb(95, 104, 117);
    }

    .editor {
        margin-top: 28px;
    }

    .footer {
        margin-top: 40px;
        font-size: 13px;
        line-height: 1.5;
        color: rgb(120, 131, 146);
    }

    .footer a {
        color: inherit;
        text-decoration: underline;
    }

    @media (min-width: 600px) {
        .window {
            padding: 230px 32px 48px;
        }

        .title {
            font-size: 22px;
        }
    }
</style>
