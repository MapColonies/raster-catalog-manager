SET search_path TO "RasterCatalogManager", public;-- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE "records" 
    ALTER COLUMN srs_name SET DEFAULT 'WGS84GEO';
