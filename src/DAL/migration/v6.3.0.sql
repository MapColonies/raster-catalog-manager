  SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT


ALTER TABLE records 
    ALTER COLUMN product_version SET NOT NULL,
    ALTER COLUMN creation_date_utc SET NOT NULL,
    ALTER COLUMN imaging_time_begin_utc SET NOT NULL,
    ALTER COLUMN imaging_time_end_utc SET NOT NULL,
    ALTER COLUMN srs SET NOT NULL,
    ALTER COLUMN srs_name SET NOT NULL;
