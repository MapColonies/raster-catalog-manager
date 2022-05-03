import { inject, injectable } from 'tsyringe';
import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../../common/constants';
import { ConnectionManager } from '../../DAL/connectionManager';
import {
  IFindRecordRequest,
  IFindRecordResponse,
  IRecordExistsResponse,
  IRecordRequestParams,
  IUpdateRecordRequest,
} from '../../common/dataModels/records';
import { RecordRepository } from '../../DAL/repositories/recordRepository';

@injectable()
export class RecordManager {
  private repository?: RecordRepository;

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, private readonly connectionManager: ConnectionManager) {}

  public async createRecord(req: IRasterCatalogUpsertRequestBody): Promise<string> {
    const repo = await this.getRepository();
    this.logger.info('creating record');
    const id = await repo.createRecord(req);
    return id;
  }

  public async updateRecord(req: IUpdateRecordRequest): Promise<void> {
    const repo = await this.getRepository();
    this.logger.info(`updating record ${req.id}`);
    await repo.updateRecord(req);
  }

  public async deleteRecord(req: IRecordRequestParams): Promise<void> {
    const repo = await this.getRepository();
    this.logger.info(`deleting record ${req.id}`);
    const res = await repo.deleteRecord(req.id);
    return res;
  }

  public async recordExists(req: IRecordRequestParams): Promise<IRecordExistsResponse> {
    const repo = await this.getRepository();
    const res = await repo.exists(req.id);
    return { exists: res };
  }

  public async findRecord(req: IFindRecordRequest): Promise<IFindRecordResponse[]> {
    const repo = await this.getRepository();
    const res = await repo.findRecords(req);
    return res;
  }

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
