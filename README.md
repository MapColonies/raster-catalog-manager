# Raster Catalog Manager Service

A manager service that exposes CUD (Create, Update and Delete) operations into catalog database. 
this service will manage the raster profiles (Best Mosaic. Discrete, etc.)
The Orm DB schema will be generated from @mc-models


## Environment Variables
the service can be configured with the following environment variables

### general configurations:

`LOG_LEVEL` - service minimal log level

`SERVER_PORT` - service http server listening port

### db configuration:

`DB_HOST` - database server host name/ip

`DB_PORT` - database server listening port (5432 is postgreSql default)

`DB_NAME` - database name to access

`DB_USER` - database username

`DB_PASSWORD` - database password

`DB_SSL_ENABLE` - boolean to enable/disable database connection ssl authentication

`DB_SSL_CA` - path for ca public certificate (required if database ssl connection is enabled)

`DB_SSL_KEY` - path for ssl private key (required if database ssl connection is enabled)

`DB_SSL_CERT` - path for ssl public certificate (required if database ssl connection is enabled)

# Notes
The Discovery (Read) operations by consumers will be against csw protocol of our pyCsw catalog - NOT this service

run ```npm run release -- --release-as <version>``` to prevent double bumping and follow release instructions.
