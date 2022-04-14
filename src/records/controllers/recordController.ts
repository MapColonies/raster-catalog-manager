import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { SERVICES } from '../../common/constants';
import {
  IFindRecordRequest,
  IFindRecordResponse,
  IRecordExistsResponse,
  OperationStatusEnum,
  IRecordOperationResponse,
  IRecordRequestParams,
  IUpdateRecordRequest,
} from '../../common/dataModels/records';
import { RecordManager } from '../models/recordManager';

type CreateRecordHandler = RequestHandler<undefined, IRecordOperationResponse, IRasterCatalogUpsertRequestBody>;
type UpdateRecordHandler = RequestHandler<IRecordRequestParams, IRecordOperationResponse, IRasterCatalogUpsertRequestBody>;
type DeleteRecordHandler = RequestHandler<IRecordRequestParams, IRecordOperationResponse>;
type RecordExistsHandler = RequestHandler<IRecordRequestParams, IRecordExistsResponse>;
type FindRecordHandler = RequestHandler<undefined, IFindRecordResponse[], IFindRecordRequest>;

@injectable()
export class RecordController {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, private readonly manager: RecordManager) {}

  public createRecord: CreateRecordHandler = async (req, res, next) => {
    try {
      const recordId = await this.manager.createRecord(req.body);
      return res.status(httpStatus.CREATED).json({
        id: recordId,
        status: OperationStatusEnum.SUCCESS,
      });
    } catch (err) {
      return next(err);
    }
  };

  public updateRecord: UpdateRecordHandler = async (req, res, next) => {
    try {
      const recordUpdateReq: IUpdateRecordRequest = { ...req.body, ...req.params };
      await this.manager.updateRecord(recordUpdateReq);
      return res.status(httpStatus.OK).json({
        id: recordUpdateReq.id,
        status: OperationStatusEnum.SUCCESS,
      });
    } catch (err) {
      return next(err);
    }
  };

  public deleteRecord: DeleteRecordHandler = async (req, res, next) => {
    try {
      const requestParmeters = req.params;
      await this.manager.deleteRecord(requestParmeters);
      return res.status(httpStatus.OK).json({
        id: requestParmeters.id,
        status: OperationStatusEnum.SUCCESS,
      });
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

  public findRecord: FindRecordHandler = async (req, res, next) => {
    try {
      const record = await this.manager.findRecord(req.body);
      return res.status(httpStatus.OK).json(record);
    } catch (err) {
      return next(err);
    }
  };
}
