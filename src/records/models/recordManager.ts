import { inject, injectable } from 'tsyringe';
import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import { IRecordExistsResponse, IRecordIdResponse, IRecordRequestParams, IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordRepository } from '../../DAL/repositories/recordRepository';

@injectable()
export class RecordManager {
  private repository?: RecordRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async createRecord(req: IRasterCatalogUpsertRequestBody): Promise<IRecordIdResponse> {
    const repo = await this.getRepository();
    this.logger.log('info', 'creating record');
    const res = await repo.createRecord(req);
    return { id: res };
  }

  public async updateRecord(req: IUpdateRecordRequest): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `updating record ${req.id}`);
    await repo.updateRecord(req);
  }

  public async deleteRecord(req: IRecordRequestParams): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `deleting record ${req.id}`);
    const res = await repo.deleteRecord(req.id);
    return res;
  }

  public async recordExists(req: IRecordRequestParams): Promise<IRecordExistsResponse> {
    const repo = await this.getRepository();
    const res = await repo.exists(req.id);
    return { exists: res };
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
