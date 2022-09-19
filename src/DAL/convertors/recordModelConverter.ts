import { singleton } from 'tsyringe';
import { GeoJSON } from 'geojson';
import { GeoJSONGeometry, stringify as geoJsonToWkt } from 'wellknown';
import { LayerMetadata, Link, IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { IFindRecordRequest, IFindRecordResponse, IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordEntity } from '../entity/generated';

@singleton()
export class RecordModelConvertor {
  public createModelToEntity(model: IRasterCatalogUpsertRequestBody): RecordEntity {
    const entity = this.metadataToPartialEntity(model.metadata);
    entity.id = model.id;
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
    if (metadata.sensors != undefined) {
      entity.sensors = metadata.sensors.join(',');
    }
    if (metadata.includedInBests != undefined) {
      if (Array.isArray(metadata.includedInBests) && metadata.includedInBests.length != 0) {
        entity.includedInBests = metadata.includedInBests.join(',');
      } else {
        (entity.includedInBests as string | null) = null;
      }
    }
    if (metadata.region != undefined) {
      if (Array.isArray(metadata.region) && metadata.region.length != 0) {
        entity.region = metadata.region.join(',');
      } else {
        (entity.region as string | null) = null;
      }
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
      if (record[key as keyof RecordEntity] !== null) {
        (metadata[key as keyof LayerMetadata] as unknown) = record[key as keyof RecordEntity];
      }
    });
    metadata.sensors = record.sensors !== '' ? record.sensors.split(',') : [];
    metadata.region = record.region ? record.region.split(',') : [];
    metadata.includedInBests =
      record.includedInBests !== '' && record.includedInBests !== undefined && record.includedInBests !== null
        ? record.includedInBests.split(',')
        : [];
    if (typeof metadata.footprint === 'string') {
      metadata.footprint = JSON.parse(metadata.footprint) as GeoJSON;
    }
    if (typeof metadata.layerPolygonParts === 'string') {
      metadata.layerPolygonParts = JSON.parse(metadata.layerPolygonParts) as GeoJSON;
    }
    if (typeof metadata.maxResolutionDeg === 'string') {
      metadata.maxResolutionDeg = Number(metadata.maxResolutionDeg);
    }
    if (typeof metadata.maxResolutionMeter === 'string') {
      metadata.maxResolutionMeter = Number(metadata.maxResolutionMeter);
    }
    if (typeof metadata.rms === 'string') {
      metadata.rms = Number(metadata.rms);
    }
    if (typeof metadata.minHorizontalAccuracyCE90 === 'string') {
      metadata.minHorizontalAccuracyCE90 = Number(metadata.minHorizontalAccuracyCE90);
    }
    return metadata;
  }
}
