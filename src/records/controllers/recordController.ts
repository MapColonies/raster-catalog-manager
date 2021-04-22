import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import {
  FindRecordsResponse,
  ICreateRecordBody,
  ICreateRecordResponse,
  IFindRecordsRequest,
  IGetRecordResponse,
  IRecordsParams,
  IUpdateRecordBody,
  IUpdateRecordRequest,
} from '../../common/dataModels/records';
import { ILogger } from '../../common/interfaces';
import { RecordManager } from '../models/recordManager';

type CreateResourceHandler = RequestHandler<undefined, ICreateRecordResponse, ICreateRecordBody>;
type FindResourceHandler = RequestHandler<undefined, FindRecordsResponse | string, undefined, IFindRecordsRequest>;
type GetResourceHandler = RequestHandler<IRecordsParams, IGetRecordResponse>;
type DeleteResourceHandler = RequestHandler<IRecordsParams, string>;
type UpdateResourceHandler = RequestHandler<IRecordsParams, string, IUpdateRecordBody>;

@injectable()
export class RecordController {
  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, private readonly manager: RecordManager) {}

  public createResource: CreateResourceHandler = async (req, res, next) => {
    try {
      const record = await this.manager.createRecord(req.body);
      return res.status(httpStatus.CREATED).json(record);
    } catch (err) {
      return next(err);
    }
  };

  public findResource: FindResourceHandler = async (req, res, next) => {
    try {
      const recordsRes = await this.manager.findRecords(req.query);
      return res.status(recordsRes.status).json(recordsRes.body);
    } catch (err) {
      return next(err);
    }
  };

  public getResource: GetResourceHandler = async (req, res, next) => {
    try {
      const record = await this.manager.getRecord(req.params);
      return res.status(httpStatus.OK).json(record);
    } catch (err) {
      return next(err);
    }
  };

  public updateResource: UpdateResourceHandler = async (req, res, next) => {
    try {
      const recordUpdateReq: IUpdateRecordRequest = { ...req.body, ...req.params };
      await this.manager.updateRecord(recordUpdateReq);
      return res.status(httpStatus.OK).send('Record updated successfully');
    } catch (err) {
      return next(err);
    }
  };

  public deleteResource: DeleteResourceHandler = async (req, res, next) => {
    try {
      await this.manager.deleteRecord(req.params);
      return res.status(httpStatus.OK).send('Record deleted successfully');
    } catch (err) {
      return next(err);
    }
  };
}
