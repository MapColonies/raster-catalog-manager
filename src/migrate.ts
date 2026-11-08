// Standalone entrypoint that applies pending Drizzle migrations and exits.
// It is not part of the service runtime; it is run manually through the migrations image (see migrations.Dockerfile).
import { join } from 'path';
import { jsLogger } from '@map-colonies/js-logger';
import type { commonDbFullV3Type } from '@map-colonies/schemas';
import { getOtelMixin } from '@map-colonies/tracing-utils';
import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { getConfig, initConfig } from './common/config';
import { DB_SCHEMA, SERVICE_NAME } from './common/constants';
import { createConnectionOptions } from './db/utils/createConnection';

const MIGRATIONS_FOLDER = join(__dirname, 'db', 'migrations');

async function main(): Promise<void> {
  await initConfig();
  const configInstance = getConfig();
  const loggerConfig = configInstance.get('telemetry.logger');

  const logger = await jsLogger({ ...loggerConfig, mixin: getOtelMixin() });
  const dbConfig = configInstance.get('db') as commonDbFullV3Type; // TODO: remove this cast after added schemas in @map-coloneis/schemas

  logger.info({ msg: 'applying migrations', database: dbConfig.database, host: dbConfig.host, migrationsFolder: MIGRATIONS_FOLDER });
  const clientConfig = createConnectionOptions(dbConfig);
  clientConfig.application_name = `${SERVICE_NAME}-migration`;
  const client = new Client(clientConfig);
  try {
    await client.connect();
    // Session-level, so it holds for every migration in the run: unqualified objects never land in public,
    // regardless of whether a migration sets search_path itself or is applied in its own run.
    await client.query(`SET search_path TO "${DB_SCHEMA}", public`);
    const drizzleLogger: Logger = {
      logQuery(query, params) {
        logger.info({ msg: query, params });
      },
    };
    await migrate(drizzle({ client, logger: drizzleLogger }), { migrationsFolder: MIGRATIONS_FOLDER, migrationsSchema: DB_SCHEMA });
    logger.info({ msg: 'migrations applied successfully' });
  } catch (error) {
    logger.error({ msg: 'failed to apply migrations', err: error });
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
