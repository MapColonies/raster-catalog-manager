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

## Database migrations
Migrations are managed with [Drizzle](https://orm.drizzle.team) and live in `src/db/migrations`, one folder per migration.

Migrations are **not** applied by the service. They are applied manually with the migrations image, which applies every pending migration in a single transaction and exits.
Applied migrations are recorded in `"RasterCatalogManager"."__drizzle_migrations"`.

> [!NOTE]  
> In previous versions, v7.x and before, the files under `src/DAL/migration` were the legacy hand-applied migration scripts. The first Drizzle migration in v8.x, `initial_schema`, is ported from `fullSchema.sql`. It creates the schema on first deployments and is safe to apply on existing ones.


Build the image:
```
docker build -f migrations.Dockerfile -t raster-catalog-manager-migrations:<version> .
```

Run it with the same db environment variables as the service (see above), for example:
```
docker run --rm -e DB_HOST=<host> -e DB_PORT=5432 -e DB_NAME=<db> -e DB_USER=<user> -e DB_PASSWORD=<password> raster-catalog-manager-migrations:<version>
```
For an ssl connection, mount the certificates and set `DB_SSL_ENABLE=true`, `DB_SSL_CA`, `DB_SSL_KEY` and `DB_SSL_CERT` to their paths inside the container.
The db user must be able to run the migration DDL and needs `CREATE` on the database (the migrator issues `CREATE SCHEMA IF NOT EXISTS` for its own table's schema).

From a checkout, `npm run migrate` builds the project and applies the migrations using the local config.

`npm run migration:create -- <name>` creates an empty `migration.sql` in a new folder, write the migration SQL there.
`npm run migration:check` validates the migrations folder.

# Notes
The Discovery (Read) operations by consumers will be against csw protocol of our pyCsw catalog - NOT this service

run ```npm run release -- --release-as <version>``` to prevent double bumping and follow release instructions.
