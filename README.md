# Osobisty Search

Personal Search Engine for private information.

Osobisty means private in Polish.

Osobisty is a universal, personal search engine by [Janaka](https://janaka.dev). It's heavily influenced by [Linus Lee's](https://thesephist.com/) [Monolce](https://github.com/thesephist/monocle) project, the UI design is a clone. It's built with React (UI), NodeJS (crawlers + indexers), Typescript, and [Typesene](https://typesense.org) for the full-text index search engine in the backend. Osobisty searches across Janaka's content; Zettlekasten, Blogs, Twitter boommarks, Chrome bookmarks, and Kindle highlights.

Read more about why I built Osobisty [here](https://janaka.dev/introducing-osobisty-universal-personal-search-engine/).

## Requirement

- Privacy guaranteed
- Search across multiple sources
  - Blogs
  - Zettelkasten
  - Web Bookmarks

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
