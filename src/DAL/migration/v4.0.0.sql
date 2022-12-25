SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

ALTER TABLE "records" ADD COLUMN transparency text;
UPDATE "records" SET transparency='TRANSPARENT';
ALTER TABLE "records" ALTER transparency SET NOT NULL;

ALTER TABLE "records" ADD COLUMN tile_output_format text;
UPDATE "records" SET tile_output_format='PNG';
ALTER TABLE "records" ALTER tile_output_format SET NOT NULL;
