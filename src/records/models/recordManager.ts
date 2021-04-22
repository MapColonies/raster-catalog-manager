import { inject, injectable } from 'tsyringe';
import httpStatus from 'http-status-codes';
import { Services } from '../../common/constants';
import { IHttpResponse, ILogger } from '../../common/interfaces';
import { ConnectionManager } from '../../DAL/connectionManager';
import {
  FindRecordsResponse,
  ICreateRecordBody,
  ICreateRecordResponse,
  IGetRecordResponse,
  IFindRecordsRequest,
  IRecordsParams,
  IUpdateRecordRequest,
} from '../../common/dataModels/records';
import { RecordRepository } from '../../DAL/repositories/recordRepository';
import { EntityNotFound } from '../../common/errors';

@injectable()
export class RecordManager {
  private repository?: RecordRepository;

  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly connectionManager: ConnectionManager) {}

  public async findRecords(req: IFindRecordsRequest): Promise<IHttpResponse<FindRecordsResponse | string>> {
    const repo = await this.getRepository();
    const res = await repo.findRecords(req);
    if (res.length === 0) {
      return {
        body: 'No records',
        status: httpStatus.NO_CONTENT,
      };
    }
    return {
      body: res,
      status: httpStatus.OK,
    };
  }

  public async createRecord(req: ICreateRecordBody): Promise<ICreateRecordResponse> {
    const repo = await this.getRepository();
    this.logger.log('info', 'creating record');
    const res = await repo.createRecord(req);
    return res;
  }

  public async getRecord(req: IRecordsParams): Promise<IGetRecordResponse> {
    const repo = await this.getRepository();
    const res = await repo.getRecord(req.recordId);
    if (res === undefined) {
      throw new EntityNotFound('Record not found');
    }
    return res;
  }

  public async updateRecord(req: IUpdateRecordRequest): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `updating record ${req.recordId}`);
    await repo.updateRecord(req);
  }

  public async deleteRecord(req: IRecordsParams): Promise<void> {
    const repo = await this.getRepository();
    this.logger.log('info', `deleting record ${req.recordId}`);
    const res = await repo.deleteRecord(req.recordId);
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
