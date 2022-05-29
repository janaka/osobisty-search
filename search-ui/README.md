# Search UI

## Get started

To run this project locally, install the dependencies and run the local server:

```sh
npm install
npm start
```

Alternatively, you may use [Yarn](https://http://yarnpkg.com/):

```sh
yarn
yarn start
```

Open http://localhost:3000 to see your app.


## Architecture

Search UI SPA

Typesense - search engine backen

Backend API proxy for auth + CORS


UI SPA -> API -> Typesense


```mermaid
flowchart TD;
    client1(search-ui)-->api1(API);
    api1-->db1[(database md files)];
    api1-->ts1[(Typesense)];
```


```mermaid
flowchart TD;
    browser1(editor 1)--sync-->browser2;
    browser2(editor 2)--sync-->browser1;
    browser1-->api1;
    browser2-->api1;
    api1(WS API )-->db1[(database md files)];
```






