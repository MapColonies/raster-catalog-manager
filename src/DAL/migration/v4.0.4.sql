SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE "records" 
    ADD CONSTRAINT proper_product_version CHECK (product_version ~* '^\d+\.\d{1,2}$');
    