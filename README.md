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
