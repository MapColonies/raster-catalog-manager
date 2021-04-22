//requests
import { OperationStatus } from './enums';

export interface IRecordsParams {
  recordId: string;
}
export interface IFindRecordsRequest {
  resourceId?: string;
  version?: string;
  isCleaned?: boolean;
  status?: OperationStatus;
  type?: string;
}

export interface ICreateRecordBody {
  resourceId: string;
  version: string;
  parameters: Record<string, unknown>;
  type: string;
  description?: string;
  status?: OperationStatus;
  reason?: string;
}

export interface IUpdateRecordBody {
  parameters?: Record<string, unknown>;
  status?: OperationStatus;
  percentage?: number;
  reason?: string;
  isCleaned?: boolean;
}

export interface IUpdateRecordRequest extends IRecordsParams, IUpdateRecordBody {}

//responses
export type FindRecordsResponse = IGetRecordResponse[];

export interface IGetRecordResponse {
  id: string;
  resourceId?: string;
  version?: string;
  // TODO: add response values
}

export interface ICreateRecordResponse {
  id: string;
  taskIds: string[];
}
