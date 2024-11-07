SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

CREATE UNIQUE INDEX product_id_case_insensitive on "records" (LOWER(product_id));  