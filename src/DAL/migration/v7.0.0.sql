SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

CREATE TYPE product_status AS ENUM ('PUBLISHED', 'UNPUBLISHED'); 
ALTER TABLE "records" 
  ADD COLUMN product_status product_status NOT NULL DEFAULT 'PUBLISHED';