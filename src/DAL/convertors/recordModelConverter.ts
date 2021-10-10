import { singleton } from 'tsyringe';
import { LayerMetadata, Link, IRasterCatalogUpsertRequestBody, SensorType } from '@map-colonies/mc-model-types';
import { GeoJSONGeometry, stringify as geoJsonToWkt } from 'wellknown';
import { IFindRecordRequest, IFindRecordResponse, IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordEntity } from '../entity/generated';

@singleton()
export class RecordModelConvertor {
  public createModelToEntity(model: IRasterCatalogUpsertRequestBody): RecordEntity {
    const entity = this.metadataToPartialEntity(model.metadata);
    if (model.links !== undefined) {
      entity.links = this.linksToString(model.links);
    }
    return entity;
  }

  public updateModelToEntity(model: IUpdateRecordRequest): RecordEntity {
    const entity = {} as RecordEntity;
    this.parseMetadata(entity, model.metadata);
    entity.id = model.id;
    if (model.links != undefined) {
      entity.links = this.linksToString(model.links);
    }
    return entity;
  }

  public findModelToEntity(model: IFindRecordRequest): Partial<RecordEntity> {
    const entity = {} as RecordEntity;
    if (model.metadata !== undefined) {
      this.parseMetadata(entity, model.metadata);
    }
    if (model.id !== undefined) {
      entity.id = model.id;
    }
    if (model.links != undefined) {
      entity.links = this.linksToString(model.links);
    }
    return entity;
  }

  public metadataToPartialEntity(metadata: Partial<LayerMetadata>): RecordEntity {
    const entity = new RecordEntity();
    this.parseMetadata(entity, metadata);
    return entity;
  }

  public entityToModel(entity: RecordEntity): IFindRecordResponse {
    const model: IFindRecordResponse = {
      id: entity.id,
      links: entity.links !== undefined ? this.stringToLinks(entity.links) : undefined,
      metadata: this.recordToMetadata(entity),
    };
    return model;
  }

  private parseMetadata(entity: RecordEntity, metadata: Partial<LayerMetadata>): void {
    Object.assign(entity, metadata);
    if (metadata.footprint != undefined) {
      entity.wktGeometry = geoJsonToWkt(metadata.footprint as unknown as GeoJSONGeometry);
    }
    if (metadata.sensorType != undefined) {
      entity.sensorType = metadata.sensorType.join(',');
    }
    if (metadata.includedInBests != undefined) {
      entity.includedInBests = metadata.includedInBests.join(',');
    }
  }

  private linksToString(links: Link[]): string {
    const stringLinks = links.map((link) => `${link.name ?? ''},${link.description ?? ''},${link.protocol ?? ''},${link.url ?? ''}`);
    return stringLinks.join('^');
  }

  private stringToLinks(stringLinks: string): Link[] {
    const links = stringLinks.split('^').map((linkString) => {
      const linkParts = linkString.split(',');
      return {
        name: linkParts[0] !== '' ? linkParts[0] : undefined,
        description: linkParts[1] !== '' ? linkParts[1] : undefined,
        protocol: linkParts[2] !== '' ? linkParts[2] : undefined,
        url: linkParts[3] !== '' ? linkParts[3] : undefined,
      } as Link;
    });
    return links;
  }

  private recordToMetadata(record: RecordEntity): LayerMetadata {
    const metadata = new LayerMetadata();
    Object.keys(metadata).forEach((key) => {
      (metadata[key as keyof LayerMetadata] as unknown) = record[key as keyof RecordEntity];
    });
    metadata.sensorType = record.sensorType !== '' ? (record.sensorType.split(',') as SensorType[]) : [];
    metadata.includedInBests =
      record.includedInBests !== '' && record.includedInBests !== undefined && record.includedInBests !== null
        ? record.includedInBests.split(',')
        : [];
    return metadata;
  }
}
