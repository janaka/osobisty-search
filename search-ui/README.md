# search-ui

_This project was generated with [create-instantsearch-app](https://github.com/algolia/create-instantsearch-app) by [Algolia](https://algolia.com)._

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

Typesense search engine

Backend API proxy for auth + CORS


UI SPA -> Tyk API Gateway -> Typesense

## Tyk API Gateway setup

fish shell `set tyksecret <secret_value>`

Reload config

```shell
curl -H "x-tyk-authorization: $tyksecret" -s http://localhost:8080/tyk/reload/group | jq
```



list API proxy rules

```shell
curl -v -H "x-tyk-authorization: $tyksecret" http://localhost:8080/tyk/apis | jq
```

Get single rule

```shell
curl -v -H "x-tyk-authorization: $tyksecret" http://localhost:8080/tyk/apis/typesense-health-987kncca93 | jq
```

Add/update API endpoint proxy rule

```shell
curl -v -H "x-tyk-authorization: $tyksecret" \
  -s \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "name": "Hello-World",
    "slug": "hello-world",
    "api_id": "Hello-World",
    "org_id": "1",
    "use_keyless": true,
    "auth": {
      "auth_header_name": "Authorization"
    },
    "definition": {
      "location": "header",
      "key": "x-api-version"
    },
    "version_data": {
      "not_versioned": true,
      "versions": {
        "Default": {
          "name": "Default",
          "use_extended_paths": true
        }
      }
    },
    "proxy": {
      "listen_path": "/hello-world/",
      "target_url": "http://echo.tyk-demo.com:8080/",
      "strip_listen_path": true
    },
    "active": true
}' http://localhost:8080/tyk/apis | jq
```

Add

```shell
curl -v -H "x-tyk-authorization: $tyksecret" \
  -s \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "name": "Typesense/health",
    "slug": "health",
    "api_id": "typesense-health-987kncca93",
    "org_id": "1",
    "use_keyless": true,
    "auth": {
      "auth_header_name": "Authorization"
    },
    "definition": {
      "location": "header",
      "key": "x-api-version"
    },
    "version_data": {
      "not_versioned": true,
      "versions": {
        "Default": {
          "name": "Default",
          "use_extended_paths": true
        }
      }
    },
    "proxy": {
      "listen_path": "/health",
      "target_url": "http://192.168.1.50:8108/",
      "strip_listen_path": false
    },
    "active": true
}' http://localhost:8080/tyk/apis | jq
```

```shell
curl -v -H "x-tyk-authorization: $tyksecret" \
  -s \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
    "name": "Typesense/collections",
    "slug": "collections",
    "api_id": "typesense-collections-njjsdf8hs",
    "org_id": "1",
    "use_keyless": true,
    "auth": {
      "auth_header_name": "X-TYPESENSE-API-KEY"
    },
    "definition": {
      "location": "header",
      "key": "x-api-version"
    },
    "version_data": {
      "not_versioned": true,
      "versions": {
        "Default": {
          "name": "Default",
          "use_extended_paths": true,
          "extended_paths": {
            "ignored": [],
            "white_list": [],
            "black_list": [],
            "cache": ["get"],
            "transform": [],
            "transform_headers": [
              {
                "delete_headers": ["X-TYPESENSE-API-KEY"],
                "add_headers": {"X-TYPESENSE-API-KEY": "$typesenseapikey"},
                "path": "collections",
                "method": "GET"
              }
            ]
          }
        }
      }
    },
    "proxy": {
      "listen_path": "/collections",
      "target_url": "http://192.168.1.50:8108/",
      "strip_listen_path": false
    },
    "active": true
}' http://localhost:8080/tyk/apis/typesense-collections-njjsdf8hs | jq
```



update API endpoint proxy rule

```shell
curl -v -H "x-tyk-authorization: $tyksecret" \
  -s \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
    "name": "Typesense/health",
    "slug": "health",
    "api_id": "typesense-health-987kncca93",
    "org_id": "1",
    "use_keyless": true,
    "auth": {
      "auth_header_name": "X-TYPESENSE-API-KEY"
    },
    "definition": {
      "location": "header",
      "key": "x-api-version"
    },
    "version_data": {
      "not_versioned": true,
      "versions": {
        "Default": {
          "name": "Default",
          "use_extended_paths": true
        }
      }
    },
    "proxy": {
      "listen_path": "/health",
      "target_url": "http://192.168.1.50:8108/",
      "strip_listen_path": false
    },
    "active": true
}' http://localhost:8080/tyk/apis/typesense-health-987kncca93 | jq
```

Add API key for basic API key auth

```shell
curl -X POST -H "x-tyk-authorization: foo" \
 -s \
 -H "Content-Type: application/json" \
 -X POST \
 -d '{
    "allowance": 1000,
    "rate": 1000,
    "per": 1,
    "expires": -1,
    "quota_max": -1,
    "org_id": "1",
    "quota_renews": 1449051461,
    "quota_remaining": -1,
    "quota_renewal_rate": 60,
    "access_rights": {
        "{API-ID}": {
            "api_id": "typesense-collections-njjsdf8hs",
            "api_name": "Typesense/collections",
            "versions": ["Default"]
        }
    },
    "meta_data": {},
    "basic_auth_data": {
        "password": "xyz"
    }
 }' http://localhost:8080/tyk/keys/typesenseapikey | jq
```


```shell
curl -H "X-TYPESENSE-API-KEY: $typesensekey"  "http://localhost:8108/collections"
```