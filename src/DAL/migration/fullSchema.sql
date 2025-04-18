SET search_path TO public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;


SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
CREATE TYPE product_status AS ENUM ('PUBLISHED', 'UNPUBLISHED'); 
-- Table: records
-- DROP TABLE records;
CREATE TABLE records
(
    identifier text COLLATE pg_catalog."default" NOT NULL,
    typename text COLLATE pg_catalog."default" NOT NULL,
    schema text COLLATE pg_catalog."default" NOT NULL,
    mdsource text COLLATE pg_catalog."default" NOT NULL,
    insert_date timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xml character varying COLLATE pg_catalog."default" NOT NULL,
    anytext text COLLATE pg_catalog."default" NOT NULL,
    wkt_geometry text COLLATE pg_catalog."default",
    wkb_geometry geometry(Geometry,4326),
    anytext_tsvector tsvector,
    product_status product_status NOT NULL DEFAULT 'UNPUBLISHED',
    product_id text COLLATE pg_catalog."default" NOT NULL CHECK (product_id ~* '^[a-zA-Z0-9_-]+$'),
    product_name text COLLATE pg_catalog."default",
    product_version text COLLATE pg_catalog."default" NOT NULL CHECK (product_version ~* '^\d+\.\d{1,2}$'),
    product_type text COLLATE pg_catalog."default" NOT NULL,
    product_sub_type text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    producer_name text COLLATE pg_catalog."default" DEFAULT 'IDFMU',
    creation_date_utc timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ingestion_date timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date_utc timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imaging_time_begin_utc timestamp with time zone NOT NULL,
    imaging_time_end_utc timestamp with time zone NOT NULL,
    max_resolution_deg numeric NOT NULL CHECK (max_resolution_deg BETWEEN 0.000000167638063430786 AND 0.703125),
    min_resolution_deg numeric NOT NULL CHECK (min_resolution_deg BETWEEN 0.000000167638063430786 AND 0.703125),
    min_horizontal_accuracy_ce_90 numeric CHECK (min_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000),
    max_horizontal_accuracy_ce_90 numeric CHECK (max_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000),
    sensors text COLLATE pg_catalog."default" NOT NULL,
    srs text COLLATE pg_catalog."default" DEFAULT '4326' NOT NULL,
    srs_name text COLLATE pg_catalog."default" DEFAULT 'WGS84GEO' NOT NULL,
    region text COLLATE pg_catalog."default" NOT NULL CHECK (region <> ''),
    classification text COLLATE pg_catalog."default" NOT NULL CHECK (classification ~* '^[0-9]$|^[1-9][0-9]$|^(100)$'),
    links text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    footprint_geojson text COLLATE pg_catalog."default" NOT NULL,
    keywords text COLLATE pg_catalog."default",
    rms text COLLATE pg_catalog."default",
    scale integer, CHECK (scale BETWEEN 0 AND 100000000),
    max_resolution_meter numeric NOT NULL CHECK (max_resolution_meter BETWEEN 0.0185 AND 78271.52),
    min_resolution_meter numeric NOT NULL CHECK (min_resolution_meter BETWEEN 0.0185 AND 78271.52),
    product_bbox text COLLATE pg_catalog."default" CHECK (product_bbox ~* '^-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?),-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?),-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?),-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?)$'),
    display_path text COLLATE pg_catalog."default" NOT NULL,
    transparency text COLLATE pg_catalog."default" NOT NULL,
    tile_output_format text COLLATE pg_catalog."default" NOT NULL,
    tile_mime_format text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT records_pkey PRIMARY KEY (identifier),
    CONSTRAINT unique_record_values UNIQUE (product_id, product_version, product_type)
);


-- Index: ix_product_id
-- DROP INDEX ix_product_id;
CREATE INDEX ix_product_id
    ON records USING btree
    (product_id COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: ix_product_name
-- DROP INDEX ix_product_name;
CREATE INDEX ix_product_name
    ON records USING btree
    (product_name COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: ix_product_version
-- DROP INDEX ix_product_version;
CREATE INDEX ix_product_version
    ON records USING btree
    (product_version COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: ix_product_type
-- DROP INDEX ix_product_type;
CREATE INDEX ix_product_type
    ON records USING btree
    (product_type COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: ix_product_sub_type
-- DROP INDEX ix_product_sub_type;
CREATE INDEX ix_product_sub_type
    ON records USING btree
    (product_sub_type COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: ix_creation_date
-- DROP INDEX ix_creation_date;
CREATE INDEX ix_creation_date_utc
    ON records USING btree
    (creation_date_utc ASC NULLS LAST);

-- Index: ix_update_date
-- DROP INDEX ix_update_date;
CREATE INDEX ix_update_date_utc
    ON records USING btree
    (update_date_utc ASC NULLS LAST);

-- Index: ix_source_start_date
-- DROP INDEX ix_source_start_date;
CREATE INDEX ix_imaging_time_begin_utc
    ON records USING btree
    (imaging_time_begin_utc ASC NULLS LAST);

-- Index: ix_source_end_date
-- DROP INDEX ix_source_end_date;
CREATE INDEX ix_imaging_time_end_utc
    ON records USING btree
    (imaging_time_end_utc ASC NULLS LAST);

-- Index: ix_max_resolution_meter
-- DROP INDEX ix_max_resolution_meter;
CREATE INDEX ix_max_resolution_meter
    ON records USING btree
    (max_resolution_meter ASC);


-- Index: ix_min_resolution_meter
-- DROP INDEX ix_min_resolution_meter;
CREATE INDEX ix_min_resolution_meter
    ON records USING btree
    (min_resolution_meter ASC);    

-- Index: ix_max_srs_id
-- DROP INDEX ix_srs_id;
CREATE INDEX ix_max_srs_id
    ON records USING btree
    (srs COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: ix_classification
-- DROP INDEX ix_classification;
CREATE INDEX ix_classification
    ON records USING btree
    (classification COLLATE pg_catalog."default" ASC NULLS LAST);

-- Index: records_wkb_geometry_idx
-- DROP INDEX records_wkb_geometry_idx;
CREATE INDEX records_wkb_geometry_idx
    ON records USING gist
    (wkb_geometry);

-- Index: fts_gin_idx
-- DROP INDEX fts_gin_idx;
-- DO NOT CHANGE THIS INDEX NAME --
-- changing its name will disable pycsw full text index
CREATE INDEX fts_gin_idx
    ON records USING gin
    (anytext_tsvector);

-- Trigger function : records_update_anytext
CREATE FUNCTION records_update_anytext() RETURNS trigger
    SET search_path FROM CURRENT
    LANGUAGE plpgsql
    AS $$
BEGIN   
  IF TG_OP = 'INSERT' THEN
    NEW.anytext := CONCAT (
      NEW.product_name,' ',
      NEW.product_version, ' ',
      NEW.product_type, ' ',
      NEW.product_sub_type, ' ',
      NEW.description, ' ',
      NEW.sensors, ' ',
      NEW.srs_name, ' ',
      NEW.region, ' ',
      NEW.classification, ' ',
      NEW.keywords);
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.anytext := CONCAT (
      COALESCE(NEW.product_name, OLD.product_name),' ',
      COALESCE(NEW.product_version, OLD.product_version), ' ',
      COALESCE(NEW.product_type, OLD.product_type), ' ',
      COALESCE(NEW.product_sub_type, OLD.product_sub_type), ' ',
      COALESCE(NEW.description, OLD.description), ' ',
      COALESCE(NEW.sensors, OLD.sensors), ' ',
      COALESCE(NEW.srs_name, OLD.srs_name), ' ',
      COALESCE(NEW.region, OLD.region), ' ',
      COALESCE(NEW.classification, OLD.classification), ' ',
      COALESCE(NEW.keywords, OLD.keywords));
  END IF;
  NEW.anytext_tsvector = to_tsvector('pg_catalog.english', NEW.anytext);
  RETURN NEW;
END;
$$;

-- Trigger: ftsupdate
-- DROP TRIGGER ftsupdate ON records;
CREATE TRIGGER ftsupdate
    BEFORE INSERT OR UPDATE
    ON records
    FOR EACH ROW
    WHEN (NEW.product_name IS NOT NULL 
      OR NEW.product_version IS NOT NULL
      OR NEW.product_type IS NOT NULL
      OR NEW.product_sub_type IS NOT NULL
      OR NEW.description IS NOT NULL
      OR NEW.sensors IS NOT NULL
      OR NEW.srs_name IS NOT NULL
      OR NEW.region IS NOT NULL
      OR NEW.classification IS NOT NULL
      OR NEW.keywords IS NOT NULL)
	 EXECUTE PROCEDURE records_update_anytext();

-- Trigger function : records_update_geometry
CREATE FUNCTION records_update_geometry() RETURNS trigger
    SET search_path FROM CURRENT
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.wkt_geometry IS NULL THEN
        RETURN NEW;
    END IF;
    NEW.wkb_geometry := ST_GeomFromText(NEW.wkt_geometry,4326);
    RETURN NEW;
END;
$$;

-- Trigger: records_update_geometry
-- DROP TRIGGER records_update_geometry ON records;
CREATE TRIGGER records_update_geometry
    BEFORE INSERT OR UPDATE
    ON records
    FOR EACH ROW
    EXECUTE PROCEDURE records_update_geometry();

--DROP INDEX product_id_and_type_case_insensitive
CREATE UNIQUE INDEX product_id_and_type_case_insensitive on "records" (LOWER(product_id),LOWER(product_type));   
