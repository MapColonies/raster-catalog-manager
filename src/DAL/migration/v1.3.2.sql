SET SCHEMA 'public'; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE public."records" 
    ALTER COLUMN srs_name SET DEFAULT 'WGS84GEO';
