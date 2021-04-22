import { ICreateRecordBody, IGetRecordResponse, IUpdateRecordRequest } from '../../../src/common/dataModels/records';
import { IGetTaskResponse } from '../../../src/common/dataModels/tasks';
import { RecordModelConvertor } from '../../../src/DAL/convertors/recordModelConverter';
import { TaskModelConvertor } from '../../../src/DAL/convertors/taskModelConvertor';
import { RecordEntity } from '../../../src/DAL/entity/record';
import { TaskEntity } from '../../../src/DAL/entity/task';

let convertor: RecordModelConvertor;

const taskCreateModelToEntityMock = jest.fn();
const taskEntityToModelMock = jest.fn();
const taskConvertorMock = ({
  createModelToEntity: taskCreateModelToEntityMock,
  entityToModel: taskEntityToModelMock,
} as unknown) as TaskModelConvertor;

describe('RecordModelConverter', function () {
  beforeEach(() => {
    convertor = new RecordModelConvertor(taskConvertorMock);
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe('createModelToEntity', function () {
    it('converted entity has only all relevant filed', function () {
      const createTaskModel1 = {
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const createTaskModel2 = {
        description: '6',
        parameters: {
          b: 7,
        },
        reason: '8',
        percentage: 9,
        type: '10',
        status: 'In-Progress',
      };
      const createRecordModel = {
        resourceId: '11',
        version: '12',
        description: '13',
        parameters: {
          d: 14,
        },
        status: 'Pending',
        reason: '15',
        type: '16',
        percentage: 17,
        tasks: [createTaskModel1, createTaskModel2],
      } as ICreateRecordBody;

      taskCreateModelToEntityMock.mockReturnValueOnce(createTaskModel1).mockReturnValueOnce(createTaskModel2);

      const res = convertor.createModelToEntity(createRecordModel);

      expect(res).toEqual(createRecordModel as RecordEntity);
      expect(taskCreateModelToEntityMock).toHaveBeenCalledTimes(2);
      expect(taskCreateModelToEntityMock).toHaveBeenCalledWith(createTaskModel1);
      expect(taskCreateModelToEntityMock).toHaveBeenCalledWith(createTaskModel2);
    });
  });

  describe('UpdateModelToEntity', function () {
    it('converted entity has only all relevant filed', function () {
      const updateRecordModel = {
        recordId: '1',
        isCleaned: true,
        parameters: {
          a: '3',
        },
        percentage: 4,
        reason: '5',
      } as IUpdateRecordRequest;
      const updateRecordEntity = ({
        id: '1',
        isCleaned: true,
        parameters: {
          a: '3',
        },
        percentage: 4,
        reason: '5',
      } as unknown) as RecordEntity;

      const res = convertor.updateModelToEntity(updateRecordModel);

      expect(res).toEqual(updateRecordEntity);
    });
  });

  describe('EntityToModel', function () {
    it('converted entity has only all relevant filed', function () {
      const taskEntity1 = {
        attempts: 9,
        creationTime: new Date(2000, 1, 2),
        description: '10',
        id: '11',
        recordId: '1',
        parameters: {
          b: '12',
        },
        percentage: 13,
        reason: '14',
        status: 'In-Progress',
        type: '15',
        updateTime: new Date(2010, 5, 6),
      } as TaskEntity;
      const taskEntity2 = {
        attempts: 16,
        creationTime: new Date(2015, 7, 8),
        description: '17',
        id: '18',
        recordId: '1',
        parameters: {
          b: '19',
        },
        percentage: 20,
        reason: '21',
        status: 'Pending',
        type: '22',
        updateTime: new Date(2020, 9, 10),
      } as TaskEntity;
      const recordEntity = {
        id: '1',
        creationTime: new Date(2000, 1, 2),
        description: '2',
        isCleaned: false,
        parameters: {
          a: '3',
        },
        percentage: 4,
        reason: '5',
        resourceId: '6',
        status: 'Pending',
        tasks: [taskEntity1, taskEntity2],
        type: '7',
        updateTime: new Date(2020, 3, 4),
        version: '8',
      } as RecordEntity;
      const taskModel1 = {
        attempts: 9,
        created: new Date(2000, 1, 2),
        description: '10',
        id: '11',
        recordId: '1',
        parameters: {
          b: '12',
        },
        percentage: 13,
        reason: '14',
        status: 'In-Progress',
        type: '15',
        updated: new Date(2010, 5, 6),
      } as IGetTaskResponse;
      const taskModel2 = {
        attempts: 16,
        created: new Date(2015, 7, 8),
        description: '17',
        id: '18',
        recordId: '1',
        parameters: {
          b: '19',
        },
        percentage: 20,
        reason: '21',
        status: 'Pending',
        type: '22',
        updated: new Date(2020, 9, 10),
      } as IGetTaskResponse;
      const recordModel = {
        id: '1',
        created: new Date(2000, 1, 2),
        description: '2',
        isCleaned: false,
        parameters: {
          a: '3',
        },
        percentage: 4,
        reason: '5',
        resourceId: '6',
        status: 'Pending',
        tasks: [taskModel1, taskModel2],
        type: '7',
        updated: new Date(2020, 3, 4),
        version: '8',
      } as IGetRecordResponse;

      taskEntityToModelMock.mockReturnValueOnce(taskModel1).mockReturnValueOnce(taskModel2);

      const res = convertor.entityToModel(recordEntity);

      expect(res).toEqual(recordModel);
      expect(taskEntityToModelMock).toHaveBeenCalledTimes(2);
      expect(taskEntityToModelMock).toHaveBeenCalledWith(taskEntity1);
      expect(taskEntityToModelMock).toHaveBeenCalledWith(taskEntity2);
    });
  });
});
