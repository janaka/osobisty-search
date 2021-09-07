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



## Scaffold a nodejs console app 

```shell
cd <project_folder>
yarn init -y # create package.json
yarn add typescript @types/node -D # add packages as dev deps
npx tsc --init # create tscongig.json
```

Update tsconfig.json

```json
{
  "compilerOptions": {
-   "target": "es5",
+   "target": "ES2020",
    ...
+   "outDir": "./build",
+   "importHelpers": false,
    ...
  }
}
```
