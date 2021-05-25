import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export declare type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export interface ILogger {
  log: (level: LogLevel, message: string) => void;
}

export interface IDbConfig extends PostgresConnectionOptions {
  enableSslAuth: boolean;
  sslPaths: { ca: string; cert: string; key: string };
}

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface IOpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}

export interface IHttpResponse<T> {
  body: T;
  status: number;
}
