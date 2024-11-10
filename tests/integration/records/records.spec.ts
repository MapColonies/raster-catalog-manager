import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { trace } from '@opentelemetry/api';
import jsLogger from '@map-colonies/js-logger';
import { TileOutputFormat, Transparency } from '@map-colonies/mc-model-types';
import { SERVICES } from '../../../src/common/constants';
import { getApp } from '../../../src/app';
import { RecordRepository } from '../../../src/DAL/repositories/recordRepository';
import { RecordEntity } from '../../../src/DAL/entity/generated';
import { registerRepository, initTypeOrmMocks, RepositoryMocks } from '../../mocks/DBMock';
import { OperationStatusEnum } from '../../../src/common/dataModels/records';
import { RecordsRequestSender } from './helpers/recordsRequestSender';

let recordRepositoryMocks: RepositoryMocks;
let requestSender: RecordsRequestSender;

const testMetadata = {
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  displayPath: 'testDisplayId',
  type: 'RECORD_RASTER',
  productId: 'testId',
  productName: 'testName',
  productVersion: '12.36',
  producerName: 'test',
  productType: 'Orthophoto',
  srs: '4326',
  srsName: 'marcator',
  updateDateUTC: '2021-06-07T05:41:43.032Z',
  imagingTimeBeginUTC: '2021-06-07T05:41:43.032Z',
  imagingTimeEndUTC: '2021-06-07T05:41:43.032Z',
  minHorizontalAccuracyCE90: 0.68,
  maxHorizontalAccuracyCE90: 0.68,
  sensors: ['Pan_Sharpen', 'test'],
  region: ['a', 'b'],
  rms: 0.444,
  scale: 1000,
  classification: '3',
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
  creationDateUTC: '2021-06-07T05:41:43.032Z',
  ingestionDate: '2021-06-07T05:41:43.032Z',
  maxResolutionDeg: 0.05,
  minResolutionDeg: 0.05,
  maxResolutionMeter: 0.5,
  minResolutionMeter: 0.5,
  transparency: Transparency.TRANSPARENT,
  tileOutputFormat: TileOutputFormat.PNG,
  tileMimeFormat: 'image/png',
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
    minHorizontalAccuracyCE90: 0.95678,
  },
};

describe('records', () => {
  beforeEach(() => {
    //remove AJV warnings from filling test log
    console.warn = jest.fn();
    initTypeOrmMocks();
    const app = getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: false, //child container is incompatible with the typeorm repositories implementation
    });
    recordRepositoryMocks = registerRepository(RecordRepository, new RecordRepository());
    requestSender = new RecordsRequestSender(app);
  });
  afterEach(() => {
    container.clearInstances();
    jest.resetAllMocks();
  });

  describe('Happy Path', () => {
    it('should create record and return status code 201 and the created record id', async () => {
      const expectedEntity = {
        ...testCreateRecordModel.metadata,
        links: ',,test,http://test.test/wmts^testLink,test test test,fulltest,http://test.test/wms',
        wktGeometry: 'POLYGON ((0 1, 1 1, 1 0, 0 1))',
        mdSource: '',
        schema: 'mc_raster',
        typeName: 'mc_MCRasterRecord',
        xml: '',
        sensors: 'Pan_Sharpen,test',
        region: 'a,b',
      };

      const executeResponse = {
        identifiers: [
          {
            id: 'recordId',
          },
        ],
      };

      const insertQueryBuilderMock = recordRepositoryMocks.insertQueryBuilder;
      insertQueryBuilderMock.execute.mockResolvedValue(executeResponse);

      const response = await requestSender.createResource(testCreateRecordModel);
      expect(response.status).toBe(httpStatusCodes.CREATED);
      expect(insertQueryBuilderMock.values).toHaveBeenCalledTimes(1);
      expect(insertQueryBuilderMock.values).toHaveBeenCalledWith(expectedEntity);
      expect(insertQueryBuilderMock.returning).toHaveBeenCalledTimes(1);
      expect(insertQueryBuilderMock.returning).toHaveBeenCalledWith('identifier');
      expect(insertQueryBuilderMock.execute).toHaveBeenCalledTimes(1);

      const body = response.body as unknown;
      expect(body).toEqual({ id: 'recordId', status: OperationStatusEnum.SUCCESS });
      expect(response).toSatisfyApiSpec();
    });

    it('should update record status and return 200', async () => {
      const recordCountMock = recordRepositoryMocks.countMock;
      const recordSaveMock = recordRepositoryMocks.saveMock;

      recordCountMock.mockResolvedValue(1);
      recordSaveMock.mockResolvedValue({});

      const response = await requestSender.updateResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c', testUpdateRecordRequest);
      expect(response).toSatisfyApiSpec();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordSaveMock).toHaveBeenCalledTimes(1);
      expect(recordSaveMock).toHaveBeenCalledWith({
        ...testUpdateRecordRequest.metadata,
        id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c',
      });

      const body = response.body as unknown;
      expect(body).toEqual({ id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c', status: OperationStatusEnum.SUCCESS });
    });

    it('should delete record return 200', async () => {
      const recordDeleteMock = recordRepositoryMocks.deleteMock;
      const recordCountMock = recordRepositoryMocks.countMock;
      recordDeleteMock.mockResolvedValue({});
      recordCountMock.mockResolvedValue(1);

      const response = await requestSender.deleteResource('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
      expect(response).toSatisfyApiSpec();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordDeleteMock).toHaveBeenCalledTimes(1);
      expect(recordDeleteMock).toHaveBeenCalledWith('170dd8c0-8bad-498b-bb26-671dcf19aa3c');

      const body = response.body as unknown;
      expect(body).toEqual({ id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c', status: OperationStatusEnum.SUCCESS });
    });

    it('should return 200 and true when record exists', async () => {
      const recordCountMock = recordRepositoryMocks.countMock;
      recordCountMock.mockResolvedValue(1);

      const response = await requestSender.recordExists('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
      expect(response).toSatisfyApiSpec();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({ id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c' });
      expect(response.body).toEqual({ exists: true });
    });

    it("should return 200 and false when record doesn't exists", async () => {
      const recordCountMock = recordRepositoryMocks.countMock;
      recordCountMock.mockResolvedValue(0);

      const response = await requestSender.recordExists('170dd8c0-8bad-498b-bb26-671dcf19aa3c');
      expect(response).toSatisfyApiSpec();

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(recordCountMock).toHaveBeenCalledTimes(1);
      expect(recordCountMock).toHaveBeenCalledWith({ id: '170dd8c0-8bad-498b-bb26-671dcf19aa3c' });
      expect(response.body).toEqual({ exists: false });
    });

    it('find should return 200 and list of records when match', async () => {
      const findMock = recordRepositoryMocks.findMock;
      const testEntity = {
        ...testCreateRecordModel.metadata,
        links: ',,test,http://test.test/wmts^testLink,test test test,fulltest,http://test.test/wms',
        wktGeometry: 'POLYGON ((0 1, 1 1, 1 0, 0 1))',
        mdSource: '',
        schema: 'mc_raster',
        typeName: 'mc:MCRasterRecord',
        xml: '',
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        sensors: 'Pan_Sharpen,test',
        region: 'a,b',
      } as unknown as RecordEntity;
      findMock.mockResolvedValue([testEntity]);
      const req = { ...testUpdateRecordRequest };

      const response = await requestSender.findRecord(req);
      const expectedResponse = [
        {
          ...testCreateRecordModel,
        },
      ];
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(expectedResponse);
      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith({
        where: {
          minHorizontalAccuracyCE90: 0.95678,
        },
      });
      expect(response).toSatisfyApiSpec();
    });

    it('should return 200 and array of exists record versions', async () => {
      const findMock = recordRepositoryMocks.findMock;
      const testEntity = {
        ...testCreateRecordModel.metadata,
        links: ',,test,http://test.test/wmts^testLink,test test test,fulltest,http://test.test/wms',
        wktGeometry: 'POLYGON ((0 1, 1 1, 1 0, 0 1))',
        mdSource: '',
        schema: 'mc_raster',
        typeName: 'mc:MCRasterRecord',
        xml: '',
        id: 'recordId',
        sensors: 'Pan_Sharpen,test',
        region: 'a,b',
      } as unknown as RecordEntity;
      findMock.mockResolvedValue([testEntity]);
      const req = {
        metadata: {
          productId: 'test_id',
          productType: 'Orthophoto',
        },
      };
      const response = await requestSender.getRecordVersions(req);
      const expectedResponse = ['12.36'];
      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(expectedResponse);
      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock).toHaveBeenCalledWith({
        select: ['productVersion'],
        where: {
          productId: 'test_id',
          productType: 'Orthophoto',
        },
      });
      expect(response).toSatisfyApiSpec();
    });
  });
  describe('Bad Path', () => {
    // due to bug in validator additional properties is not compilable with allof
    // https://github.com/cdimascio/express-openapi-validator/issues/239
    // additionalProperties: false

    // eslint-disable-next-line jest/no-commented-out-tests
    // it('should return status code 400 on PUT request with invalid body', async () => {
    //   const recordCountMock = recordRepositoryMocks.countMock;
    //   const response = await requestSender.updateResource('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', {
    //     invalidField: 'test',
    //   });
    //   expect(response).toSatisfyApiSpec();
    //   expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    //   expect(recordCountMock).toHaveBeenCalledTimes(0);
    // });

    it('should return status code 400 on POST request with invalid body', async () => {
      const recordCountMock = recordRepositoryMocks.countMock;
      const response = await requestSender.createResource({
        id: 'invalidField',
      });
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(recordCountMock).toHaveBeenCalledTimes(0);
      expect(response).toSatisfyApiSpec();
    });

    it('should return status code 400 on POST request with invalid footprint', async () => {
      const req = { ...testCreateRecordModel, ...{ metadata: { footprint: { type: 'Geometry' } } } };
      const recordCountMock = recordRepositoryMocks.countMock;

      const response = await requestSender.createResource(req);
      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(recordCountMock).toHaveBeenCalledTimes(0);
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('Sad Path', () => {
    it('should return status code 404 on PUT request for non existing record', async () => {
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
      expect(response).toSatisfyApiSpec();
    });

    it('should return status code 404 on DELETE request for non existing record', async () => {
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
      expect(response).toSatisfyApiSpec();
    });

    it('should return status code 409 on POST request for existing record id', async () => {
      const recordCountMock = recordRepositoryMocks.countMock;
      recordCountMock.mockResolvedValue(1);
      const req = { ...testCreateRecordModel };

      const response = await requestSender.createResource(req);
      expect(response.status).toBe(httpStatusCodes.CONFLICT);
      expect(response).toSatisfyApiSpec();
    });
  });
});
