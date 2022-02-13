SET search_path TO "RasterCatalogManager", public;-- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE "records" 
	ALTER COLUMN producer_name SET DEFAULT 'IDFMU',
	ALTER COLUMN creation_date SET DEFAULT CURRENT_TIMESTAMP,
	ALTER COLUMN srs SET DEFAULT '4326',
	ALTER COLUMN srs_name SET DEFAULT 'WGS84 Geo';
