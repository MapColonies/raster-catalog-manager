import { BadRequestError } from '@map-colonies/error-types';
import { validateUpdatableFields } from '../../../../src/utils/zod/updateRequestSchema';

describe('SchemasValidator', () => {
  describe('validateUpdateRequestSchema', () => {
    it('should validate schema and return the proper object when valid data is provided', () => {
      const metadataRequest = {
        metadata: {
          classification: '6',
          productName: 'Product Name',
          productSubType: 'SubType',
          description: 'A valid description.',
          producerName: 'Producer',
          region: ['Region1', 'Region2'],
          scale: 10000,
          keywords: 'key',
        },
      };

      const result = validateUpdatableFields(metadataRequest);

      expect(result).toEqual(metadataRequest);
    });

    it('should throw a BadRequestError when classification is invalid', () => {
      const metadataRequest = {
        metadata: {
          classification: 'invalid-classification',
        },
      };

      expect(() => validateUpdatableFields(metadataRequest)).toThrow(BadRequestError);
    });

    it('should throw a BadRequestError when scale is out of range', () => {
      const metadataRequest = {
        metadata: {
          scale: -1,
        },
      };

      expect(() => validateUpdatableFields(metadataRequest)).toThrow(BadRequestError);
    });

    it('should throw a BadRequestError when region is empty', () => {
      const metadataRequest = {
        metadata: {
          region: [],
        },
      };

      expect(() => validateUpdatableFields(metadataRequest)).toThrow(BadRequestError);
    });

    it('should throw a BadRequestError when an unexpected field is provided', () => {
      const metadataRequest = {
        metadata: {
          unexpectedField: 'unexpected',
        },
      };

      expect(() => validateUpdatableFields(metadataRequest)).toThrow(BadRequestError);
    });

    it('should throw a BadRequestError when additionalProperty in the request object', () => {
      const request = {
        metadata: {
          avi: 'unexpected',
        },
        avi: 'party',
      };

      expect(() => validateUpdatableFields(request)).toThrow(BadRequestError);
    });
  });
});
