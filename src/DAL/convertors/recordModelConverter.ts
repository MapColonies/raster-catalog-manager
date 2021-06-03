import { singleton } from 'tsyringe';
import { LayerMetadata, Link, IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import getBbox from '@turf/bbox';
import { IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordEntity } from '../entity/record';

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
    const entity = this.createModelToEntity(model);
    entity.id = model.id;
    return entity;
  }

  public metadataToPartialEntity(metadata: Partial<LayerMetadata>): RecordEntity {
    const entity = new RecordEntity();
    Object.assign(entity, metadata);
    if (metadata.footprint != undefined) {
      const bbox = metadata.footprint.bbox ?? getBbox(metadata.footprint);
      const bboxLength2D = 4;
      if (bbox.length !== bboxLength2D) {
        //TODO: replace with costume error
        throw new Error('invalid footprint, only 2D is supported');
      }
      entity.wktGeometry = `POLYGON ((${bbox[0]} ${bbox[1]}, ${bbox[2]} ${bbox[1]}, ${bbox[2]} ${bbox[3]}, ${bbox[0]} ${bbox[3]}, ${bbox[0]} ${bbox[1]}))`;
    }
    return entity;
  }

  private linksToString(links: Link[]): string {
    const stringLinks = links.map((link) => `${link.name ?? ''},${link.description ?? ''},${link.protocol ?? ''},${link.url ?? ''}`);
    return stringLinks.join('^');
  }
}
