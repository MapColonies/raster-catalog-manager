import { BadRequestError } from '@map-colonies/error-types';
import { IRasterCatalogUpdateRequestBody, VALIDATIONS } from '@map-colonies/mc-model-types';
import { z, ZodError } from 'zod';

const updatableFieldsSchema = z
  .object({
    metadata: z
      .object({
        classification: z.string().regex(new RegExp(VALIDATIONS.classification.pattern)).optional(),
        productName: z.string().min(1).optional(),
        productSubType: z.string().optional(),
        description: z.string().optional(),
        producerName: z.string().optional(),
        region: z.array(z.string().min(1)).min(1).optional(),
        scale: z.number().min(VALIDATIONS.scale.min).max(VALIDATIONS.scale.max).optional(),
      })
      .strict(),
  })
  .strict();

const formatStrError = (error: ZodError): string => {
  const errorMessages: string[] = [];
  error.errors.forEach((errDetail) => {
    const path = errDetail.path.join('.');
    if (path) {
      const message = errDetail.message;
      errorMessages.push(`${path}: ${message}`);
    }
  });
  if (error.formErrors.formErrors.length > 0) {
    errorMessages.push(`Global Errors: ${error.formErrors.formErrors.toString()}`);
  }
  return errorMessages.join(' | ');
};

export const validateUpdatableFields = (data: unknown): IRasterCatalogUpdateRequestBody => {
  const result = updatableFieldsSchema.safeParse(data);
  if (!result.success) {
    throw new BadRequestError(formatStrError(result.error));
  }
  const validData = result.data;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return validData;
};
