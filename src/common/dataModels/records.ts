import { IRasterCatalogEditRequestBody, IRasterCatalogUpsertRequestBody, RecordStatus } from '@map-colonies/mc-model-types';

//requests
export interface IRecordRequestParams {
  id: string;
}

export interface IUpdateRecordRequest extends IRasterCatalogUpsertRequestBody, IRecordRequestParams {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IFindRecordRequest extends Partial<IUpdateRecordRequest> {}

export interface IEditRecordRequest extends IRasterCatalogEditRequestBody, IRecordRequestParams {}

export interface IUpdateRecordStatusRequest {
  productStatus: RecordStatus;
}

//responses
export enum OperationStatusEnum {
  SUCCESS = 'success',
}

export interface IRecordOperationResponse {
  id: string;
  status: OperationStatusEnum;
}

export interface IRecordExistsResponse {
  exists: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IFindRecordResponse extends Partial<IRasterCatalogUpsertRequestBody> {}
