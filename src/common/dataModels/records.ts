import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';

//requests
export interface IRecordRequestParams {
  id: string;
}

export interface IUpdateRecordRequest extends IRasterCatalogUpsertRequestBody, IRecordRequestParams {}

//responses
export interface IRecordIdResponse {
  id: string;
}

export interface IRecordExistsResponse {
  exists: boolean;
}
