import { IRasterCatalogUpsertRequestBody, LayerMetadata, Link, ProductType, RecordType, SensorType } from '@map-colonies/mc-model-types';
import { IUpdateRecordRequest } from '../../../src/common/dataModels/records';
import { RecordModelConvertor } from '../../../src/DAL/convertors/recordModelConverter';
import { RecordEntity } from '../../../src/DAL/entity/generated';

let convertor: RecordModelConvertor;

describe('RecordModelConverter', function () {
  beforeEach(() => {
    convertor = new RecordModelConvertor();
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe('createModelToEntity', function () {
    it('converted entity has only all relevant filed', function () {
      const testMetadata = { test: 'test' } as unknown as LayerMetadata;
      const createRecordModel = {
        metadata: testMetadata,
        links: [
          {
            name: 'testLink1',
            description: 'testDescription1',
            protocol: 'testProtocol1',
            url: 'testUrl1',
          },
          {
            name: '',
            description: '',
            protocol: 'testProtocol2',
            url: 'testUrl2',
          },
        ] as Link[],
      } as IRasterCatalogUpsertRequestBody;
      const metadataToPartialEntityMock = jest.fn();
      metadataToPartialEntityMock.mockReturnValue({});
      convertor.metadataToPartialEntity = metadataToPartialEntityMock;

      const res = convertor.createModelToEntity(createRecordModel);

      const expectedLinks = 'testLink1,testDescription1,testProtocol1,testUrl1^,,testProtocol2,testUrl2';
      expect(metadataToPartialEntityMock).toHaveBeenCalledTimes(1);
      expect(metadataToPartialEntityMock).toHaveBeenCalledWith(testMetadata);
      expect(res).toEqual({ links: expectedLinks });
    });
  });

  describe('UpdateModelToEntity', function () {
    it('converted entity has only all relevant filed', function () {
      const testMetadata = { productName: 'test' } as unknown as LayerMetadata;
      const testLinks = [] as Link[];
      const updateRecordModel = {
        metadata: testMetadata,
        links: testLinks,
        id: 'testId',
      } as IUpdateRecordRequest;

      const res = convertor.updateModelToEntity(updateRecordModel);

      expect(res).toEqual({ ...testMetadata, id: 'testId', links: '' });
    });
  });

  describe('metadataToPartialEntity', function () {
    it('converted entity has only all relevant filed', function () {
      const date = new Date(2021, 6, 6, 10, 21, 35);
      const testMetadata = {
        productId: 'testId',
        productName: 'test',
        productVersion: '1',
        productType: ProductType.ORTHOPHOTO,
        description: 'test test',
        creationDate: date,
        ingestionDate: date,
        updateDate: date,
        sourceDateStart: date,
        sourceDateEnd: date,
        resolution: 0.00759,
        accuracyCE90: 0.98,
        sensorType: [SensorType.RGB, SensorType.VIS],
        footprint: {
          type: 'Polygon',
          coordinates: [
            [
              [34.811938017107494, 31.95475033759175],
              [34.82237261707599, 31.95475033759175],
              [34.82237261707599, 31.96426962177354],
              [34.811938017107494, 31.96426962177354],
              [34.811938017107494, 31.95475033759175],
            ],
          ],
        },
        srsId: '4326',
        srsName: 'WGS84GEO',
        region: 'a,b',
        classification: '3',
        producerName: 'test producer',
        rms: 3,
        scale: '100',
        type: RecordType.RECORD_RASTER,
        layerPolygonParts: undefined,
        maxResolutionMeter: 0.5,
        includedInBests: ['1', '2'],
        rawProductData: undefined,
        productBoundingBox: '0,0 : 1,1',
      } as LayerMetadata;

      const res = convertor.metadataToPartialEntity(testMetadata);

      const expectedEntity = {
        productId: 'testId',
        productName: 'test',
        productVersion: '1',
        productType: 'Orthophoto',
        description: 'test test',
        creationDate: date,
        ingestionDate: date,
        updateDate: date,
        sourceDateStart: date,
        sourceDateEnd: date,
        resolution: 0.00759,
        accuracyCE90: 0.98,
        sensorType: 'RGB,VIS',
        footprint: {
          type: 'Polygon',
          coordinates: [
            [
              [34.811938017107494, 31.95475033759175],
              [34.82237261707599, 31.95475033759175],
              [34.82237261707599, 31.96426962177354],
              [34.811938017107494, 31.96426962177354],
              [34.811938017107494, 31.95475033759175],
            ],
          ],
        },
        srsId: '4326',
        srsName: 'WGS84GEO',
        region: 'a,b',
        classification: '3',
        producerName: 'test producer',
        rms: 3,
        scale: '100',
        type: RecordType.RECORD_RASTER,
        typeName: 'mc_MCRasterRecord',
        wktGeometry:
          'POLYGON ((34.811938017107494 31.95475033759175, 34.82237261707599 31.95475033759175, 34.82237261707599 31.96426962177354, 34.811938017107494 31.96426962177354, 34.811938017107494 31.95475033759175))',
        layerPolygonParts: undefined,
        schema: 'mc_raster',
        mdSource: '',
        xml: '',
        maxResolutionMeter: 0.5,
        includedInBests: '1,2',
        rawProductData: undefined,
        productBoundingBox: '0,0 : 1,1',
      } as unknown as RecordEntity;

      expect(res).toBeInstanceOf(RecordEntity);
      expect(res).toEqual(expectedEntity);
    });
  });

  describe('entityToModel', () => {
    it('converted model have all and only model data', () => {
      const date = new Date(2021, 6, 6, 10, 21, 35);
      const entity = {
        productId: 'testId',
        productName: 'test',
        productVersion: '1',
        productType: 'Orthophoto',
        description: 'test test',
        creationDate: date,
        ingestionDate: date,
        updateDate: date,
        sourceDateStart: date,
        sourceDateEnd: date,
        resolution: 0.00759,
        accuracyCE90: 0.98,
        sensorType: 'RGB',
        footprint: {
          type: 'Polygon',
          coordinates: [
            [
              [34.811938017107494, 31.95475033759175],
              [34.82237261707599, 31.95475033759175],
              [34.82237261707599, 31.96426962177354],
              [34.811938017107494, 31.96426962177354],
              [34.811938017107494, 31.95475033759175],
            ],
          ],
        },
        srsId: '4326',
        srsName: 'WGS84GEO',
        region: 'a,b',
        classification: '3',
        producerName: 'test producer',
        rms: 3,
        scale: '100',
        type: RecordType.RECORD_RASTER,
        typeName: 'mc:MCRasterRecord',
        wktGeometry:
          'POLYGON ((34.811938017107494 31.95475033759175, 34.82237261707599 31.95475033759175, 34.82237261707599 31.96426962177354, 34.811938017107494 31.96426962177354, 34.811938017107494 31.95475033759175))',
        layerPolygonParts: undefined,
        schema: 'mc_raster',
        mdSource: '',
        xml: '',
        id: 'testRecordId',
        links: 'a,b,c,d^,,e,f',
        maxResolutionMeter: 0.5,
        includedInBests: '1,2',
      } as unknown as RecordEntity;

      const model = convertor.entityToModel(entity);

      const expectedMetadata = {
        productId: 'testId',
        productName: 'test',
        productVersion: '1',
        productType: ProductType.ORTHOPHOTO,
        description: 'test test',
        creationDate: date,
        ingestionDate: date,
        updateDate: date,
        sourceDateStart: date,
        sourceDateEnd: date,
        resolution: 0.00759,
        accuracyCE90: 0.98,
        sensorType: [SensorType.RGB],
        footprint: {
          type: 'Polygon',
          coordinates: [
            [
              [34.811938017107494, 31.95475033759175],
              [34.82237261707599, 31.95475033759175],
              [34.82237261707599, 31.96426962177354],
              [34.811938017107494, 31.96426962177354],
              [34.811938017107494, 31.95475033759175],
            ],
          ],
        },
        srsId: '4326',
        srsName: 'WGS84GEO',
        region: 'a,b',
        classification: '3',
        producerName: 'test producer',
        rms: 3,
        scale: '100',
        type: RecordType.RECORD_RASTER,
        layerPolygonParts: undefined,
        includedInBests: ['1', '2'],
        maxResolutionMeter: 0.5,
        rawProductData: undefined,
      } as LayerMetadata;
      const expectedModel = {
        id: 'testRecordId',
        metadata: expectedMetadata,
        links: [
          {
            name: 'a',
            description: 'b',
            protocol: 'c',
            url: 'd',
          },
          {
            name: undefined,
            description: undefined,
            protocol: 'e',
            url: 'f',
          },
        ],
      };

      expect(model).toEqual(expectedModel);
    });
  });
});
