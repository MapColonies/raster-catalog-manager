/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import { container } from 'tsyringe';
import config from 'config';
import { DEFAULT_SERVER_PORT, SERVICES } from './common/constants';

import { getApp } from './app';
import { ConnectionManager } from './DAL/connectionManager';

interface IServerConfig {
  port: string;
}

const serverConfig = config.get<IServerConfig>('server');
const port: number = parseInt(serverConfig.port) || DEFAULT_SERVER_PORT;

const app = getApp();

const logger = container.resolve<Logger>(SERVICES.LOGGER);
const stubHealthcheck = async (): Promise<void> => Promise.resolve();
// eslint-disable-next-line @typescript-eslint/naming-convention
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
