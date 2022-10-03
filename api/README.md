# Osobisty API

OpenAPI/Swagger API Docs at `<base_url>/documentation`
OpenAPI/Swagger API spec at `<base_url>/swagger.json`

## Dev

- `yarn watch` for hot reloading
- `yarn start` to start the api server
- `yarn build` to build

API version number is pulled from the package.json version number.

## Build API Client Lib

Generate a TypeScript clinet from the OpenAPI/Swagger spec.

`yarn add swagger-typescript-api -D`

From the route of the API code repo
`npx swagger-typescript-api -p "http://localhost:3002/swagger.json" -o ./client-lib -n osobisty-client.ts`

## OpenAPI / Swagger spec

The backend dynamically generates the spec file available at `<base_url>/swagger.json`. The Swagger-api HAPI plugin does the heavy lifting. 

Top level meta info is defined in the `api-server.ts`.

The rest of the spec is based on the req and res vaidation defined using `joi` and any types/interfaces.


## SSL for localhost

- Generate a RSA-2048 key as save to `rootCA.key`
  - `openssl genrsa -des3 -out rootCA.key 2048`
- use the key you generated to create a new Root SSL certificate as save to `rootCA.pem`
  - `openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem`
- Tell your Mac to trust your root certificate so all individual certificates issued by it are also trusted.
  - Open Keychain Access on your Mac and go to the Certificates category in your System keychain. Once there, import the `rootCA.pem` using File > Import Items. Double click the imported certificate and change the “When using this certificate:” dropdown to Always Trust in the Trust section.
- Create a [v3.ext](./v3.ext) file in order to create a [X509 v3 certificate](https://en.wikipedia.org/wiki/X.509). Notice how we’re specifying `subjectAltName`
- Create a certificate key for `localhost` using the configuration settings stored in `server.csr.cnf`. This key is stored in `server.key`.
  - `openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )`
- A certificate signing request is issued via the root SSL certificate we created earlier to create a domain certificate for `localhost`. The output is a certificate file called `server.crt`.
  - `openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext`

[source](https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/)

## Docs data structure

Doc contents - is held as a Slate AST.

Doc change tracking and instance syncing (aka collaborative editing) - y-js is used to create a shared data type that holds the Slate AST, which handles tracking and syncing changes between all open instances of a doc. Technicallly it syncs between any instance of the shared type representing the doc. This means we sync between client side React and the backend using the same mechanism as between a doc betwen two tabs or two devices. I've chosen to use the client<>server syncing model with websockets (y-socket).

Server:

- in-memory _docs_ collection of type y-doc - which also track metadata including connections, pressence, leveldb doc instance, and serialzed instance.
- Pesisted change tracking - using leveldb each docs changes are tracked. This enabled multiple clients to edit the same doc overtime in any order because change tracking information is shared.
- Serialised storage - each doc is serialised and persisted to "disk" in markdown format


Collection names

- encode storage folder path in the the collection name. Relative to root path. replace "/" with "_"
- source of truth is in the Dbms
- collection name will need to be passed around otherwise doc names will have to be unique across colleciton which probably isn't ideal.