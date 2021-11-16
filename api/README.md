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
