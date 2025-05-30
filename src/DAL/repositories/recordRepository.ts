import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { IRasterCatalogUpsertRequestBody, RecordStatus } from '@map-colonies/mc-model-types';
import { Logger } from '@map-colonies/js-logger';
import { ConflictError } from '@map-colonies/error-types';
import { SERVICES } from '../../common/constants';
import { RecordEntity } from '../entity/generated';
import { RecordModelConvertor } from '../convertors/recordModelConverter';
import { EntityNotFound } from '../../common/errors';
import { IEditRecordRequest, IFindRecordRequest, IFindRecordResponse, IUpdateRecordRequest } from '../../common/dataModels/records';

@EntityRepository(RecordEntity)
export class RecordRepository extends Repository<RecordEntity> {
  private readonly appLogger: Logger; //don't override internal repository logger.
  private readonly recordConvertor: RecordModelConvertor;

  public constructor() {
    super();
    //direct injection don't work here due to being initialized by typeOrm
    this.appLogger = container.resolve(SERVICES.LOGGER);
    this.recordConvertor = container.resolve(RecordModelConvertor);
  }

  public async createRecord(req: IRasterCatalogUpsertRequestBody): Promise<string> {
    const entity = this.recordConvertor.createModelToEntity(req);
    if (await this.exists(entity.id)) {
      throw new ConflictError(`Duplicate identifier: ${entity.id}`);
    }
    const res = await this.createQueryBuilder().insert().values(entity).returning('identifier').execute();
    return res.identifiers[0]['id'] as string;
  }

  public async updateRecord(req: IUpdateRecordRequest): Promise<void> {
    if (!(await this.exists(req.id))) {
      throw new EntityNotFound(`record ${req.id} was not found for update request`);
    }

    const entity = this.recordConvertor.updateModelToEntity(req);
    await this.save(entity);
  }

  public async editRecord(req: IEditRecordRequest): Promise<void> {
    if (!(await this.exists(req.id))) {
      throw new EntityNotFound(`record ${req.id} was not found for update request`);
    }

    const entity = this.recordConvertor.editModelToEntity(req);
    await this.save(entity);
  }

  public async updateRecordStatus(id: string, productStatus: RecordStatus): Promise<void> {
    if (!(await this.exists(id))) {
      throw new EntityNotFound(`record ${id} was not found for update request`);
    }

    const entity = this.recordConvertor.updateStatusModelToEntity(id, productStatus);
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
    const query = this.createQueryBuilder('record');

    const baseConditions = { ...entity };
    if (entity.productId != null) {
      delete baseConditions.productId;
    }
    if (entity.productType != null) {
      delete baseConditions.productType;
    }

    // Apply base conditions to the query
    query.where(baseConditions);
    if (entity.productId != null) {
      query.andWhere('LOWER(record.productId) = LOWER(:productId)', { productId: entity.productId });
    }

    if (entity.productType != null) {
      query.andWhere('LOWER(record.productType) = LOWER(:productType)', { productType: entity.productType });
    }

    const res = await query.getMany();
    return res.map((entity) => this.recordConvertor.entityToModel(entity));
  }

  public async getRecordVersions(req: IFindRecordRequest): Promise<string[]> {
    const entity = this.recordConvertor.findModelToEntity(req);
    const res = await this.find({
      select: ['productVersion'],
      where: entity,
    });
    return res.map((entity) => entity.productVersion as string);
  }
}
