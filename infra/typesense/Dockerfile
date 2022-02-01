FROM typesense/typesense:0.21.0
#typesense/typesense:0.21.0 --config=/typesense/typesense-server.local.ini
COPY typesense-server.prod.ini .

ENTRYPOINT ["/opt/typesense-server", "--config=./typesense-server.prod.ini"]