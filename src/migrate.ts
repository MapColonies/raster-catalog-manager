// Standalone entrypoint that applies pending Drizzle migrations and exits.
// It is not part of the service runtime; it is run manually from the service image with the command overridden (see README).
import { createConnectionOptions, runMigrations } from '@map-colonies/drizzle-utils';
import { jsLogger } from '@map-colonies/js-logger';
import type { commonDbFullV1Type, commonDbFullV3Type } from '@map-colonies/schemas';
import { getOtelMixin } from '@map-colonies/tracing-utils';
import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { getConfig, initConfig } from './common/config';
import { DB_SCHEMA, SERVICE_NAME } from './common/constants';

async function main(): Promise<void> {
  await initConfig();
  const configInstance = getConfig();
  const loggerConfig = configInstance.get('telemetry.logger');

  const logger = await jsLogger({ ...loggerConfig, mixin: getOtelMixin() });
  const dbConfig = configInstance.get('db') as commonDbFullV3Type; // TODO: remove this cast after added schemas in @map-coloneis/schemas

  logger.info({ msg: 'applying migrations', database: dbConfig.database, host: dbConfig.host });
  let client: Client | undefined;
  try {
    const clientConfig = createConnectionOptions(dbConfig as commonDbFullV1Type); // drizzle-utils is typed for V1, which requires ssl.ca when ssl is enabled (it reads the file unconditionally).
    clientConfig.application_name = `${SERVICE_NAME}-migration`;
    client = new Client(clientConfig);
    await client.connect();

    // Session-level, so it holds for every migration in the run: unqualified objects never land in public,
    // regardless of whether a migration sets search_path itself or is applied in its own run.
    await client.query(`SET search_path TO "${DB_SCHEMA}", public`);

    const drizzleLogger: Logger = {
      logQuery(query, params) {
        logger.info({ msg: query, params });
      },
    };

    // Looks for db/migrations next to this file (dist/db/migrations after the build).
    await runMigrations(drizzle({ client, logger: drizzleLogger }), DB_SCHEMA, __dirname);
    logger.info({ msg: 'migrations applied successfully' });
  } catch (error) {
    logger.error({ msg: 'failed to apply migrations', err: error });
    process.exitCode = 1;
  } finally {
    await client?.end();
  }
}

void main();
