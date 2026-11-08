import { readFileSync } from 'fs';
import type { commonDbFullV3Type } from '@map-colonies/schemas';
import type { ClientConfig } from 'pg';
import { SERVICE_NAME } from '@src/common/constants';

export const createConnectionOptions = (dbConfig: commonDbFullV3Type): ClientConfig => {
  const { host, port, username, password, database, ssl } = dbConfig;
  const clientConfig: ClientConfig = { host, port, user: username, password, database };
  if (ssl.enabled) {
    clientConfig.password = undefined;
    clientConfig.ssl = {
      key: readFileSync(ssl.key),
      cert: readFileSync(ssl.cert),
      ca: ssl.ca !== undefined && ssl.ca !== '' ? readFileSync(ssl.ca) : undefined,
    };
  }
  clientConfig.application_name = SERVICE_NAME;
  return clientConfig;
};
