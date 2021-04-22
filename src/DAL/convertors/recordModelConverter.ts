import { singleton } from 'tsyringe';
import { ICreateRecordBody, IGetRecordResponse, IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordEntity } from '../entity/record';

@singleton()
export class RecordModelConvertor {
  public constructor() {}

  public createModelToEntity(model: ICreateRecordBody): RecordEntity {
    const entity = new RecordEntity();
    Object.assign(entity, { ...model });
    return entity;
  }

  public updateModelToEntity(model: IUpdateRecordRequest): RecordEntity {
    const entity = new RecordEntity();
    Object.assign(entity, { ...model, id: model.recordId, recordId: undefined });
    return entity;
  }

  public entityToModel(entity: RecordEntity): IGetRecordResponse {
    const model = { ...entity };
    return model as IGetRecordResponse;
  }
}
