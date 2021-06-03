import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import { IRecordExistsResponse, IRecordIdResponse, IRecordRequestParams, IUpdateRecordRequest } from '../../common/dataModels/records';
import { ILogger } from '../../common/interfaces';
import { RecordManager } from '../models/recordManager';

type CreateRecordHandler = RequestHandler<undefined, IRecordIdResponse, IRasterCatalogUpsertRequestBody>;
type UpdateRecordHandler = RequestHandler<IRecordRequestParams, string, IRasterCatalogUpsertRequestBody>;
type DeleteRecordHandler = RequestHandler<IRecordRequestParams>;
type RecordExistsHandler = RequestHandler<IRecordRequestParams, IRecordExistsResponse>;

@injectable()
export class RecordController {
  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly manager: RecordManager) {}

  public createRecord: CreateRecordHandler = async (req, res, next) => {
    try {
      const recordId = await this.manager.createRecord(req.body);
      return res.status(httpStatus.CREATED).send(recordId);
    } catch (err) {
      return next(err);
    }
  };

  public updateRecord: UpdateRecordHandler = async (req, res, next) => {
    try {
      const recordUpdateReq: IUpdateRecordRequest = { ...req.body, ...req.params };
      await this.manager.updateRecord(recordUpdateReq);
      return res.status(httpStatus.OK).send('Record updated successfully');
    } catch (err) {
      return next(err);
    }
  };

  public deleteRecord: DeleteRecordHandler = async (req, res, next) => {
    try {
      await this.manager.deleteRecord(req.params);
      return res.status(httpStatus.OK).send('Record deleted successfully');
    } catch (err) {
      return next(err);
    }
  };

  public recordExists: RecordExistsHandler = async (req, res, next) => {
    try {
      const exist = await this.manager.recordExists(req.params);
      return res.status(httpStatus.OK).send(exist);
    } catch (err) {
      return next(err);
    }
  };
}
