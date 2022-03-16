# Osobisty Search

Content indexers for Osobistry search, the personsal information search engine.
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
curl https://localhost:8108/health
```

`{"ok":true}`

```shell
curl https://localhost:3002/typesense:80/health \
-H 'authorization: Bearer '
```


`curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" http://localhost:8108/collections`

`curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" "http://localhost:8108/collections/zettleDocuments/documents/search?q=paas&query_by=title"`

```shell
curl "https://localhost:8108/multi_search?query_by=title" \
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

Create scoped API key for API [PROD]

```shell
curl 'https://localhost:3002/typesense:80/keys' \
    -X POST \
    -H 'Content-Type: application/json' \
    -H 'authorization: Bearer sklfjskdhfksdhfblk34h3k4hb3k4h3k '\
    -d '{"description":"read:zettleDocuments","actions": ["document:get", "documents:search"], "collections": ["zettleDocuments"]}'
```

Create scoped API key for API [LOCAL]

```shell
curl 'https://localhost:8108/keys' \
    -X POST \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    -H 'Content-Type: application/json' \
    -d '{"description":"read:zettleDocuments","actions": ["document:get", "documents:search"], "collections": ["zettleDocuments"]}'
```

Create scoped API key for Indexer [PROD]

```shell
curl 'https://localhost:3002/typesense:80/keys' \
    -X POST \
    -H 'Content-Type: application/json' \
    --header 'authorization: Bearer kjdshfkshdflkjhsdfskdfhsjskdkjdj \
    -d '{"description":"Key for zettleDocuments Indexer app","actions": ["document:get", "documents:search", "documents:create", "documents:upsert","documents:update", "documents:delete", "collections:delete", "collections:create"], "collections": ["zettleDocuments"]}'
```

Create scoped API key for Indexer [LOCAL]

```shell
curl 'https://localhost:8108/keys' \
    -X POST \
    -H 'Content-Type: application/json' \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    -d '{"description":"Key for zettleDocuments Indexer app","actions": ["document:get", "documents:search", "documents:create", "documents:upsert","documents:update", "documents:delete", "collections:delete", "collections:create"], "collections": ["zettleDocuments"]}'
```

A separate key for collection management

collections:delete
collections:create

Note1: get the bearer by hitting the Auth0 endpoint. Grab from the curl command app from the console. In production we'll do this dynamically but locally we don't want the secret leaking.

Note2: remember we don't hit Typesense directly anymore in prod, rather via the proxy. So stick to the same in local dev.

Note3: self-signed certs don't work with Node. So locally we cannot hit Typesense via the API.
## Build and run

- build `yarn build`
  - note: build `outDir: "/build"` in `tsconfig.json`
- run `yarn start`


## Dev

- watch mode `yarn watch`
- run `yarn start`

## Notes

Currently using a single collection for with a `type` field to distinguish variations of type. The overhead of a separate collocation is only worth it for types that are very different from each other. Multi search is possible across collections however results are returned separately for each collection. They can me merged client side using the `match_score`. 



