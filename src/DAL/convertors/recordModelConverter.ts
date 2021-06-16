import { singleton } from 'tsyringe';
import { LayerMetadata, Link, IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { GeoJSONGeometry, stringify as geoJsonToWkt } from 'wellknown';
import { IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordEntity } from '../entity/generated';

@singleton()
export class RecordModelConvertor {
  public createModelToEntity(model: IRasterCatalogUpsertRequestBody): RecordEntity {
    const entity = this.metadataToPartialEntity(model.metadata);
    if (model.links != undefined) {
      entity.links = this.linksToString(model.links);
    }
    return entity;
  }

  public updateModelToEntity(model: IUpdateRecordRequest): RecordEntity {
    const entity = {} as RecordEntity;
    this.parseMetadata(entity, model.metadata);
    entity.id = model.id;
    return entity;
  }

  public metadataToPartialEntity(metadata: Partial<LayerMetadata>): RecordEntity {
    const entity = new RecordEntity();
    this.parseMetadata(entity, metadata);
    return entity;
  }

  private parseMetadata(entity: RecordEntity, metadata: Partial<LayerMetadata>): void {
    Object.assign(entity, metadata);
    if (metadata.footprint != undefined) {
      entity.wktGeometry = geoJsonToWkt(metadata.footprint as unknown as GeoJSONGeometry);
    }
  }

  private linksToString(links: Link[]): string {
    const stringLinks = links.map((link) => `${link.name ?? ''},${link.description ?? ''},${link.protocol ?? ''},${link.url ?? ''}`);
    return stringLinks.join('^');
  }
}
