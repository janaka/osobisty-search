# Osobisty Search

Personal Search Engine for private information

## Requirement

- Privacy guaranteed
- Search across multiple sources
  - Blogs
  - Zettelkasten
  - Web Bookmarks

## Typesense search engine

```shell
docker pull typesense/typesense:0.21.0
```

```shell
mkdir /data/typesense-data
```

`yarn run typesenseServer`


```shell
export TYPESENSE_API_KEY=xyz

docker run -p 8108:8108 -v/<fqdn_path>/osobisty-search/indexer/data/typesense-data:/data typesense/typesense:0.21.0 \
  --data-dir /data --enable-cors --api-key=$TYPESENSE_API_KEY
```

Check it's working

```shell
curl http://localhost:8108/health
```

`{"ok":true}`



`curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" http://localhost:8108/collections`

`curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" "http://localhost:8108/collections/zettleDocuments/documents/search?q=paas&query_by=title"`

```shell
curl "http://localhost:8108/multi_search?query_by=title" \
        -w json \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
        -d '{
          "searches": [
            {
              "collection": "zettleDocuments",
              "q": "paas",
              "facet_by": "type, tags",
              "include_fields": "id,type"
            }
          ]
        }'
```

## Build and run

- build `yarn build`
  - note: build `outDir: "/build"` in `tsconfig.json`
- run `yarn start`


## Dev

- watch mode `yarn watch`
- run `yarn start`

## Notes

Currently using a single collection for with a `type` field to distinguish variations of type. The overhead of a separate collocation is only worth it for types that are very different from each other. Multi search is possible across collections however results are returned separately for each collection. They can me merged client side using the `match_score`. 