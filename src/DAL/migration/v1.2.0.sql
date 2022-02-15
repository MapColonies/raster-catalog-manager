SET search_path TO "RasterCatalogManager", public;-- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE records
    ADD COLUMN max_resolution_meter VARCHAR(10),
    ADD COLUMN raw_product_data jsonb,
    ADD COLUMN product_bbox VARCHAR(255);
