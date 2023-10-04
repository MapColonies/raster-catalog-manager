SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

ALTER TABLE "records" ADD COLUMN tile_mime_format text;

UPDATE "records" r SET tile_mime_format = o.mime_format
FROM (
	SELECT identifier, concat('image/',lower(tile_output_format)) as mime_format
    FROM "records"
  ) as o
WHERE r.identifier = o.identifier;

ALTER TABLE "records" ALTER tile_mime_format SET NOT NULL;


