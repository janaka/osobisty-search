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