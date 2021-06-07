import { singleton } from 'tsyringe';
import { LayerMetadata, Link, IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import getBbox from '@turf/bbox';
import { IUpdateRecordRequest } from '../../common/dataModels/records';
import { RecordEntity } from '../entity/record';
import { BadRequest } from '../../common/errors';

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
    const fullEntity = this.createModelToEntity(model);
    const entity = {} as RecordEntity;
    entity.id = model.id;
    Object.entries(fullEntity).forEach(([key, value]) => {
      if (key in model.metadata) {
        (entity[key as keyof RecordEntity] as unknown) = value;
      }
    });
    return entity;
  }

  public metadataToPartialEntity(metadata: Partial<LayerMetadata>): RecordEntity {
    const entity = new RecordEntity();
    Object.assign(entity, metadata);
    if (metadata.footprint != undefined) {
      let bbox = metadata.footprint.bbox;
      if (bbox === undefined) {
        try {
          bbox = getBbox(metadata.footprint);
        } catch (err) {
          throw new BadRequest('invalid footprint geojson');
        }
      }
      const bboxLength2D = 4;
      if (bbox.length !== bboxLength2D) {
        throw new BadRequest('invalid footprint, only 2D is supported');
      }
      const upperLeft = `${bbox[0]} ${bbox[1]}`;
      const upperRight = `${bbox[2]} ${bbox[1]}`;
      const lowerRight = `${bbox[2]} ${bbox[3]}`;
      const lowerLeft = `${bbox[0]} ${bbox[3]}`;
      entity.wktGeometry = `POLYGON ((${upperLeft},${upperRight},${lowerRight},${lowerLeft},${upperLeft}))`;
    }
    return entity;
  }

  private linksToString(links: Link[]): string {
    const stringLinks = links.map((link) => `${link.name ?? ''},${link.description ?? ''},${link.protocol ?? ''},${link.url ?? ''}`);
    return stringLinks.join('^');
  }
}
