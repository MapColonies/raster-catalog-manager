import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { RecordEntity } from '../entity/record';
import {
  FindRecordsResponse,
  ICreateRecordBody,
  ICreateRecordResponse,
  IGetRecordResponse,
  IFindRecordsRequest,
  IUpdateRecordRequest,
} from '../../common/dataModels/records';
import { RecordModelConvertor } from '../convertors/recordModelConverter';
import { DBConstraintError, EntityNotFound } from '../../common/errors';

@EntityRepository(RecordEntity)
export class RecordRepository extends Repository<RecordEntity> {
  private readonly appLogger: ILogger; //don't override internal repository logger.
  private readonly recordConvertor: RecordModelConvertor;

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(Services.LOGGER);
    this.recordConvertor = container.resolve(RecordModelConvertor);
  }

  public async findRecords(req: IFindRecordsRequest): Promise<FindRecordsResponse> {
    const entities = await this.find({ where: req, relations: ['tasks'] });
    const models = entities.map((entity) => this.recordConvertor.entityToModel(entity));
    return models;
  }

  public async createRecord(req: ICreateRecordBody): Promise<ICreateRecordResponse> {
    let entity = this.recordConvertor.createModelToEntity(req);
    entity = await this.save(entity);
    return {
      id: entity.id,
      taskIds:[], // TODO: remove task Id's
    };
  }

  public async getRecord(id: string): Promise<IGetRecordResponse | undefined> {
    const entity = await this.findOne(id, { relations: ['tasks'] });
    const model = entity ? this.recordConvertor.entityToModel(entity) : undefined;
    return model;
  }

  public async updateRecord(req: IUpdateRecordRequest): Promise<void> {
    if (!(await this.exists(req.recordId))) {
      throw new EntityNotFound(` record ${req.recordId} was not found for update request`);
    }
    const entity = this.recordConvertor.updateModelToEntity(req);
    await this.save(entity);
  }

  public async exists(id: string): Promise<boolean> {
    const recordCount = await this.count({ id: id });
    return recordCount === 1;
  }

  public async deleteRecord(id: string): Promise<void> {
    if (!(await this.exists(id))) {
      throw new EntityNotFound(` record ${id} was not found for delete request`);
    }
    try {
      await this.delete(id);
    } catch (err) {
      const pgForeignKeyConstraintViolationErrorCode = '23503';
      const error = err as Error & { code: string };
      if (error.code === pgForeignKeyConstraintViolationErrorCode) {
        this.appLogger.log('info', `failed to delete record ${id} because it have tasks`);
        throw new DBConstraintError(`record ${id} have tasks`);
      } else {
        throw err;
      }
    }
  }
}
