import { SensorType } from '@map-colonies/mc-model-types';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'records' })
// TODO: Add following row to Generator
@Index('discreteIndex', ['id', 'version'], { unique: true })
// TODO: Rename class Metadata to RecordEntity
export class RecordEntity {
  @Column({ name: 'source', type: 'text' })
  public source: string;
  @Column({ name: 'sourceName', type: 'text' })
  public sourceName: string;
  @Column({ name: 'updateDate', type: 'timestamp without time zone' })
  public updateDate: Date;
  @Column({ name: 'resolution', type: 'real' })
  public resolution: number;
  @Column({ name: 'ep90', type: 'real', nullable: true })
  public ep90?: number;
  @Column({ name: 'sensorType', type: 'text' })
  public sensorType: SensorType;
  @Column({ name: 'rms', type: 'real', nullable: true })
  public rms?: number;
  @Column({ name: 'scale', type: 'text', nullable: true })
  public scale?: string;
  @Column({ name: 'description', type: 'text', nullable: true })
  public dsc?: string;
  @Column({ name: 'geojson', type: 'text', nullable: true })
  public geometry?: object;
  // TODO: Add following row to Generator instead of column, primary cannot be nullable
  @PrimaryColumn('varchar', { length: 300 })
  // TODO: must remove the ? from id?: string;
  public id: string;
  // TODO: Add following row to Generator instead of column, primary cannot be nullable
  @PrimaryColumn('varchar', { length: 300 })
  // TODO: must remove the ? from id?: string;
  public version: string;
  @Column({ name: 'typename', type: 'text' })
  public typeName: string;
  @Column({ name: 'schema', type: 'text' })
  public schema: string;
  @Column({ name: 'mdsource', type: 'text' })
  public mdSource: string;
  @Column({ name: 'xml', type: 'text' })
  public xml: string;
  @Column({ name: 'anytext', type: 'text' })
  public anyText: string;
  @Column({ name: 'insert_date', type: 'timestamp without time zone' })
  public insertDate: Date;
  @Column({ name: 'wkt_geometry', type: 'text', nullable: true })
  public wktGeometry?: string;
  @Column({ name: 'links', type: 'text', nullable: true })
  public links?: string;
  @Column({ name: 'anytext_tsvector', type: 'tsvector', nullable: true })
  public anyTextTsvector?: string;
  @Column({ name: 'wkb_geometry', type: 'geometry', spatialFeatureType: 'Geometry', srid: 4326, nullable: true })
  public wkbGeometry?: string;
  @Column({ name: 'title', type: 'text', nullable: true })
  public title?: string;
  @Column({ name: 'type', type: 'text', nullable: true })
  public type?: string;
  @Column({ name: 'srs', type: 'text', nullable: true })
  public srs?: string;
  @Column({ name: 'producer_name', type: 'text', default: 'IDFMU', nullable: true })
  public producerName?: string;
  @Column({ name: 'project_name', type: 'text', nullable: true })
  public projectName?: string;
}
