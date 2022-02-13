SET search_path TO "RasterCatalogManager", public;-- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE "records"
    ADD CONSTRAINT unique_record_values UNIQUE (product_id, product_version, product_type);
