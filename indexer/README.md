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

export TYPESENSE_API_KEY=xyz

docker run -p 8108:8108 -v~/code-projects/osobisty-search/data/typesense-data:/data typesense/typesense:0.21.0 \
  --data-dir /data --api-key=$TYPESENSE_API_KEY
```

```shell
curl http://localhost:8108/health
```

`{"ok":true}`



`curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" http://localhost:8108/collections`

`curl -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" "http://localhost:8108/collections/zettleDocuments/documents/search?q=paas&query_by=title"`


## Collection Schema in Typesense for Documents

	//unique identifier
	ID string `json:"id"`
	//title
	Title string `json:"title"`
	//potential link to the source if applicable
	Link string `json:"link"`
	//text content to display on results page
	Content string `json:"content"`
	//map of tokens to their frequency



## Build and run

- build `npx tsc`
  - note: build `outDir: "/build"` in `tsconfig.json`
- run `node ./build/main.js`


## Dev

- watch mode `npx tsc -n -p`
- run `node ./build/main.js`