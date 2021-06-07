import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { RecordRepository } from '../../../src/DAL/repositories/recordRepository';
import { registerTestValues } from '../../testContainerConfig';
import { RecordEntity } from '../../../src/DAL/entity/record';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import * as requestSender from './helpers/recordsRequestSender';

let recordRepositoryMocks: RepositoryMocks;

const testMetadata = {
  type: 'RECORD_RASTER',
  productId: 'testId',
  productName: 'testName',
  productVersion: 'testVersion',
  producerName: 'test',
  productType: 'raster',
  srsId: 'epsg:4326',
  srsName: 'marcator',
  updateDate: '2021-06-07T05:41:43.032Z',
  sourceDateStart: '2021-06-07T05:41:43.032Z',
  sourceDateEnd: '2021-06-07T05:41:43.032Z',
  accuracyCE90: 0.68,
  sensorType: 'Pan_Sharpen',
  region: 'a',
  rms: 0.444,
  scale: '1:9',
  footprint: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 1],
      ],
    ],
  },
  creationDate: '2021-06-07T05:41:43.032Z',
  ingestionDate: '2021-06-07T05:41:43.032Z',
};

const testCreateRecordModel = {
  metadata: testMetadata,
  links: [
    {
      protocol: 'test',
      url: 'http://test.test/wmts',
    },
    {
      name: 'testLink',
      description: 'test test test',
      protocol: 'fulltest',
      url: 'http://test.test/wms',
    },
  ],
};

const testUpdateRecordRequest = {
  metadata: {
    accuracyCE90: 0.95678,
  },
};

describe('records', function () {
  beforeEach(() => {
    registerTestValues();
    requestSender.init();
    initTypeOrmMocks();
    recordRepositoryMocks = registerRepository(RecordRepository, new RecordRepository());
    //remove AJV warnings from filling test log
    console.warn = jest.fn();
  });
  afterEach(function () {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should create record and return status code 201 and the created record id', async function () {
      const expectedEntity = {
        ...testCreateRecordModel.metadata,
        links: ',,test,http://test.test/wmts^testLink,test test test,fulltest,http://test.test/wms',
        wktGeometry: 'POLYGON ((0 0,1 0,1 1,0 1,0 0))',
      };

      const recordEntity = {
        ...expectedEntity,
        id: 'recordId',
      } as unknown as RecordEntity;

      const recordSaveMock = recordRepositoryMocks.saveMock;
      recordSaveMock.mockResolvedValue(recordEntity);

      const response = await requestSender.createResource(testCreateRecordModel);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(recordSaveMock).toHaveBeenCalledTimes(1);
      expect(recordSaveMock).toHaveBeenCalledWith(expectedEntity);

      const body = response.body as unknown;
      expect(body).toEqual({ id: 'recordId' });
    });

    it('should update record status and return 200', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordSaveMock = recordRepositoryMocks.saveMock;

      recordCountMock.mockResolvedValue(1);
      recordSaveMock.mockResolvedValue({});

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', testUpdateRecordRequest);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordSaveMock).toHaveBeenCalledTimes(1);
      expect(recordSaveMock).toHaveBeenCalledWith({
        ...testUpdateRecordRequest.metadata,
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });
    });

    it('should delete record return 200', async function () {
      const recordDeleteMock = recordRepositoryMocks.deleteMock;
      const recordCountMock = recordRepositoryMocks.countMock;
      recordDeleteMock.mockResolvedValue({});
      recordCountMock.mockResolvedValue(1);

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordDeleteMock).toHaveBeenCalledTimes(1);
      expect(recordDeleteMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
    });

    it('should return 200 and true when record exists', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      recordCountMock.mockResolvedValue(1);

      const response = await requestSender.recordExists('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({ id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c' });
      expect(response.body).toEqual({ exists: true });
    });

    it("should return 200 and true when record doesn't exists", async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      recordCountMock.mockResolvedValue(0);

      const response = await requestSender.recordExists('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({ id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c' });
      expect(response.body).toEqual({ exists: false });
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

    it('should return status code 400 on POST request with invalid footprint', async function () {
      const req = { ...testCreateRecordModel };
      (req.metadata.footprint as unknown) = { type: 'Geometry' };
      const recordCountMock = recordRepositoryMocks.countMock;

      const response = await requestSender.createResource(req);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(recordCountMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('Sad Path', function () {
    it('should return status code 404 on PUT request for non existing record', async function () {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordSaveMock = recordRepositoryMocks.saveMock;
      recordCountMock.mockResolvedValue(0);
      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', testUpdateRecordRequest);
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
  });
});
