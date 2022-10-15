# Osobisty

Is a Zettlekasten / second brain type system. It includes fast search as you type functionality (aka a personal information search engine)

Osobisty means private in Polish.

Osobisty is a universal, personal search engine by [Janaka](https://janaka.dev). It's heavily influenced by [Linus Lee's](https://thesephist.com/) [Monolce](https://github.com/thesephist/monocle) project, the UI design is a clone. It's built with React (UI), NodeJS (crawlers + indexers), Typescript, and [Typesene](https://typesense.org) for the full-text index search engine in the backend. Osobisty searches across Janaka's content; Zettlekasten, Blogs, Twitter boommarks, Chrome bookmarks, and Kindle highlights.

Read more about why I built Osobisty [here](https://janaka.dev/introducing-osobisty-universal-personal-search-engine/).

## Requirement

- Content privacy and security by design
  - Accessible from personal and work devices
  - No local filesystem content storage
- Search across multiple sources
  - Blogs
  - Zettelkasten
  - Web Bookmarks
- Content is highly portable

## Repo strucrure 

root
|- api - all backend endpoints (REST and WebSocket) are served from this single backend
|- chrome-extension - experiement building web page context functinality such as symantic search and page notes. Will probably host the Inbox and TODO
|- indexer - Builds the search index in Typesense from different sources like MD notes, Twitter bookmark exports, Kindle note exports etc.
|- infra - config for Render.com infra setup
|- search-ui - UI providing search as you type and note editing functionality.

## Typesense search engine

```shell
docker pull typesense/typesense:0.21.0
```

```shell
mkdir /data/typesense-data

export TYPESENSE_API_KEY=xyz

docker run -p 8108:8108 -v~/code-projects/osobisty-search/data/typesense-data:/data typesense/typesense:0.21.0 \
  --data-dir /data --enable-cors --api-key=$TYPESENSE_API_KEY
```


## TODO

- Deploy TODO and Inbox verison
  - [x] task: switch websocket endpoint for prod environment
  - [x] taks: switch Auth0 config for production environment
- [x] task: switch on auth-over-websocket on the /documents endpoint. Validate with tests
- [] task: switch UI y-websocket connection string to prod/dev env config
- [x] feature: notes inbox - desktop web. able to use as primary notes inbox over VS Code MD file
- [x] feature: TODO list - desktop web. able to use as primary TODO over VS Code MD file.
- [x] feature: MD minimum support for inbox and todo
  - H1-H4
  - bold, italics
  - unordered bullet list
  - unordered chechbox list (no indenting)
  - raw links
- MD serialization bugs
  - [] bug: bullet lists have two `*` should be `tabs+*`
  - [] bug: text marks such as italics, bold etc. not serializing at all
- Editor bugs
  - [] bug: link paste over text replaces the text. should link the selected text.
  - [] bug: inline code blocks don't work becaues backtick is being overridden by some keyboard shortcut
  - [] bug: code blocks don't work. mayeb the autoformatter is missing
- feature: quick copy text as MD from Osobisty doc 
  





