import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { ILogger } from '../../common/interfaces';
import { Services } from '../../common/constants';
import { RecordEntity } from '../entity/generated';
import { RecordModelConvertor } from '../convertors/recordModelConverter';
import { EntityNotFound } from '../../common/errors';
import { IFindRecordRequest, IFindRecordResponse, IUpdateRecordRequest } from '../../common/dataModels/records';

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

  public async createRecord(req: IRasterCatalogUpsertRequestBody): Promise<string> {
    const entity = this.recordConvertor.createModelToEntity(req);
    const res = await this.createQueryBuilder().insert().values(entity).returning('identifier').execute();
    return res.identifiers[0]['id'] as string;
  }

  public async updateRecord(req: IUpdateRecordRequest): Promise<void> {
    if (!(await this.exists(req.id))) {
      throw new EntityNotFound(` record ${req.id} was not found for update request`);
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
    await this.delete(id);
  }

  public async findRecords(req: IFindRecordRequest): Promise<IFindRecordResponse[]> {
    const entity = this.recordConvertor.findModelToEntity(req);
    const res = await this.find({
      where: entity,
    });
    return res.map((entity) => this.recordConvertor.entityToModel(entity));
  }
}
