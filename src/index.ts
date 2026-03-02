// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import type { Logger } from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import { DEFAULT_SERVER_PORT, SERVICES } from './common/constants';
import { getApp } from './app';
import { ConnectionManager } from './DAL/connectionManager';
import { ConfigType } from './common/config';

const app = getApp();

const logger = container.resolve<Logger>(SERVICES.LOGGER);
const config = container.resolve<ConfigType>(SERVICES.CONFIG);
const serverConfig = config.get('server');
const port: number = serverConfig.port || DEFAULT_SERVER_PORT;

const stubHealthcheck = async (): Promise<void> => Promise.resolve();

const server = createTerminus(createServer(app), { healthChecks: { '/liveness': stubHealthcheck, onSignal: container.resolve('onSignal') } });
const dbConnectionManager = container.resolve(ConnectionManager);
dbConnectionManager
  .init()
  .then(() => logger.info('Establish success connection to db'))
  .catch((error) => {
    const connErr = `Failed on db connection with error: ${(error as Error).message}`;
    logger.error(connErr);
    throw Error(connErr);
  });

server.listen(port, () => {
  logger.info(`app started on port ${port}`);
});
