SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

CREATE UNIQUE INDEX product_id_and_type_case_insensitive on "records" (LOWER(product_id),LOWER(product_type));  