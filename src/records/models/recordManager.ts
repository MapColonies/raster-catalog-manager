import { inject, injectable } from 'tsyringe';
import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { Logger } from '@map-colonies/js-logger';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { Tracer } from '@opentelemetry/api';
import { SERVICES } from '../../common/constants';
import { ConnectionManager } from '../../DAL/connectionManager';
import {
  IFindRecordRequest,
  IFindRecordResponse,
  IRecordExistsResponse,
  IRecordRequestParams,
  IUpdateRecordExtendedRequest,
} from '../../common/dataModels/records';
import { RecordRepository } from '../../DAL/repositories/recordRepository';

@injectable()
export class RecordManager {
  private repository?: RecordRepository;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    private readonly connectionManager: ConnectionManager
  ) {}

  @withSpanAsyncV4
  public async createRecord(req: IRasterCatalogUpsertRequestBody): Promise<string> {
    const repo = await this.getRepository();
    this.logger.info('creating record');
    const id = await repo.createRecord(req);
    return id;
  }

  @withSpanAsyncV4
  public async updateRecord(req: IUpdateRecordExtendedRequest): Promise<void> {
    const repo = await this.getRepository();
    this.logger.info(`updating record ${req.id}`);
    await repo.updateRecord(req);
  }

  @withSpanAsyncV4
  public async deleteRecord(req: IRecordRequestParams): Promise<void> {
    const repo = await this.getRepository();
    this.logger.info(`deleting record ${req.id}`);
    const res = await repo.deleteRecord(req.id);
    return res;
  }

  @withSpanAsyncV4
  public async recordExists(req: IRecordRequestParams): Promise<IRecordExistsResponse> {
    const repo = await this.getRepository();
    const res = await repo.exists(req.id);
    return { exists: res };
  }

  @withSpanAsyncV4
  public async findRecord(req: IFindRecordRequest): Promise<IFindRecordResponse[]> {
    const repo = await this.getRepository();
    const res = await repo.findRecords(req);
    return res;
  }

  @withSpanAsyncV4
  public async getRecordVersions(req: IFindRecordRequest): Promise<string[]> {
    const repo = await this.getRepository();
    const res = await repo.getRecordVersions(req);
    return res;
  }

  private async getRepository(): Promise<RecordRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getRecordRepository();
    }
    return this.repository;
  }
}
