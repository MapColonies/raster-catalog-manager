import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { RecordRepository } from '../../../src/DAL/repositories/recordRepository';
import { registerTestValues } from '../../testContainerConfig';
import { RecordEntity } from '../../../src/DAL/entity/record';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import * as requestSender from './helpers/recordsRequestSender';

let recordRepositoryMocks: RepositoryMocks;

describe('records', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    recordRepositoryMocks = registerRepository(RecordRepository, new RecordRepository());
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should create record with tasks and return status code 201 and the created record and tasks ids', async function () {
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
      };
      const createRecordRes = {
        id: 'recordId',
        taskIds: ['taskId1', 'taskId2'],
      };
      const recordEntity = ({
        ...createRecordModel,
        id: 'recordId',
        tasks: [
          { ...createTaskModel1, recordId: 'recordId', id: 'taskId1' },
          { ...createTaskModel2, recordId: 'recordId', id: 'taskId2' },
        ],
      } as unknown) as RecordEntity;

      const recordSaveMock = recordRepositoryMocks.saveMock;
      recordSaveMock.mockResolvedValue(recordEntity);

      const response = await requestSender.createResource(createRecordModel);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(recordSaveMock).toHaveBeenCalledTimes(1);
      expect(recordSaveMock).toHaveBeenCalledWith(createRecordModel);

      const body = response.body as unknown;
      expect(body).toEqual(createRecordRes);
    });

    it('should create record without tasks and return status code 201 and the created record', async function () {
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
      };
      const createRecordRes = {
        id: 'recordId',
        taskIds: [],
      };
      const recordEntity = ({ ...createRecordModel, id: 'recordId', tasks: [] } as unknown) as RecordEntity;

      const recordSaveMock = recordRepositoryMocks.saveMock;
      recordSaveMock.mockResolvedValue(recordEntity);

      const response = await requestSender.createResource(createRecordModel);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(recordSaveMock).toHaveBeenCalledTimes(1);
      expect(recordSaveMock).toHaveBeenCalledWith(createRecordModel);

      const body = response.body as unknown;
      expect(body).toEqual(createRecordRes);
    });

    it('should get all records and return 200', async function () {
      const taskModel = {
        recordId: 'recordId',
        id: 'taskId',
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const recordModel = {
        id: 'recordId',
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
        tasks: [taskModel],
      };
      const recordEntity = (recordModel as unknown) as RecordEntity;

      const recordsFindMock = recordRepositoryMocks.findMock;
      recordsFindMock.mockResolvedValue([recordEntity]);

      const response = await requestSender.getResources();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordsFindMock).toHaveBeenCalledTimes(1);
      expect(recordsFindMock).toHaveBeenCalledWith({ relations: ['tasks'], where: {} });

      const records = response.body as unknown;
      expect(records).toEqual([recordModel]);
    });

    it('should not find filtered records and return 204', async function () {
      const filter = {
        isCleaned: true,
        resourceId: '1',
        status: 'Pending',
        type: '2',
        version: '3',
      };

      const recordsFindMock = recordRepositoryMocks.findMock;
      recordsFindMock.mockResolvedValue([] as RecordEntity[]);

      const response = await requestSender.getResources(filter);

      expect(response.status).toBe(httpStatusCodes.NO_CONTENT);
      expect(recordsFindMock).toHaveBeenCalledTimes(1);
      expect(recordsFindMock).toHaveBeenCalledWith({ relations: ['tasks'], where: filter });
    });

    it('should get specific record and return 200', async function () {
      const taskModel = {
        recordId: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
        id: 'taskId',
        description: '1',
        parameters: {
          a: 2,
        },
        reason: '3',
        percentage: 4,
        type: '5',
      };
      const recordModel = {
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
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
        tasks: [taskModel],
      };
      const recordEntity = (recordModel as unknown) as RecordEntity;

      const recordsFinOneMock = recordRepositoryMocks.findOneMock;
      recordsFinOneMock.mockResolvedValue(recordEntity);

      const response = await requestSender.getResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordsFinOneMock).toHaveBeenCalledTimes(1);
      expect(recordsFinOneMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        relations: ['tasks'],
      });

      const record = response.body as unknown;
      expect(record).toEqual(recordModel);
    });

    it('should update record status and return 200', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordSaveMock = recordRepositoryMocks.saveMock;

      recordCountMock.mockResolvedValue(1);
      recordSaveMock.mockResolvedValue({});

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        status: 'In-Progress',
      });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordSaveMock).toHaveBeenCalledTimes(1);
      expect(recordSaveMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
        status: 'In-Progress',
      });
    });

    it('should delete record without tasks and return 200', async function () {
      const recordDeleteMock = recordRepositoryMocks.deleteMock;
      const recordCountMock = recordRepositoryMocks.countMock;
      recordDeleteMock.mockResolvedValue({});
      recordCountMock.mockResolvedValue(1);

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordDeleteMock).toHaveBeenCalledTimes(1);
      expect(recordDeleteMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
    });
  });

  describe('Bad Path', function () {
    it('should return status code 400 on PUT request with invalid body', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        invalidFiled: 'test',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(recordCountMock).toHaveBeenCalledTimes(0);
    });

    it('should return status code 400 on POST request with invalid body', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const response = await requestSender.createResource({
        id: 'invalidFiled',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(recordCountMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status code 404 on GET request for non existing record', async function () {
      const recordsFindOneMock = recordRepositoryMocks.findOneMock;
      recordsFindOneMock.mockResolvedValue(undefined);

      const response = await requestSender.getResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(recordsFindOneMock).toHaveBeenCalledTimes(1);
      expect(recordsFindOneMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        relations: ['tasks'],
      });
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on PUT request for non existing record', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordSaveMock = recordRepositoryMocks.saveMock;
      recordCountMock.mockResolvedValue(0);

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', {
        status: 'Pending',
      });

      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
      expect(recordSaveMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 404 on DELETE request for non existing record', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordDeleteMock = recordRepositoryMocks.deleteMock;
      recordCountMock.mockResolvedValue(0);

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
      expect(recordDeleteMock).toHaveBeenCalledTimes(0);
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    });

    it('should return status code 422 on DELETE request for record with tasks', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordDeleteMock = recordRepositoryMocks.deleteMock;
      recordCountMock.mockResolvedValue(1);
      recordDeleteMock.mockRejectedValue({
        code: '23503',
      });

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
      expect(recordDeleteMock).toHaveBeenCalledTimes(1);
      expect(recordDeleteMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
      expect(response.status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
    });
  });
});
