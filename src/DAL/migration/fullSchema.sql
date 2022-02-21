SET search_path TO public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
-- Table: records
-- DROP TABLE records;
CREATE TABLE records
(
    identifier text COLLATE pg_catalog."default" NOT NULL DEFAULT uuid_generate_v4(),
    typename text COLLATE pg_catalog."default" NOT NULL,
    schema text COLLATE pg_catalog."default" NOT NULL,
    mdsource text COLLATE pg_catalog."default" NOT NULL,
    insert_date timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xml character varying COLLATE pg_catalog."default" NOT NULL,
    anytext text COLLATE pg_catalog."default" NOT NULL,
    wkt_geometry text COLLATE pg_catalog."default",
    wkb_geometry geometry(Geometry,4326),
    anytext_tsvector tsvector,

    product_id text COLLATE pg_catalog."default" NOT NULL,
    product_name text COLLATE pg_catalog."default",
    product_version text COLLATE pg_catalog."default",
    product_type text COLLATE pg_catalog."default",
    product_sub_type text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    producer_name text COLLATE pg_catalog."default" DEFAULT 'IDFMU',
    creation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ingestion_date timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date timestamp with time zone NOT NULL,
    source_start_date timestamp with time zone,
    source_end_date timestamp with time zone,
    resolution text COLLATE pg_catalog."default",
    horizontal_accuracy_ce_90 text COLLATE pg_catalog."default",
    sensor_type text COLLATE pg_catalog."default",
    srs text COLLATE pg_catalog."default" DEFAULT '4326',
    srs_name text COLLATE pg_catalog."default" DEFAULT 'WGS84GEO',
    region text COLLATE pg_catalog."default",
    classification text COLLATE pg_catalog."default",
    links text COLLATE pg_catalog."default" NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    footprint_geojson text COLLATE pg_catalog."default" NOT NULL,
    keywords text COLLATE pg_catalog."default",
    rms text COLLATE pg_catalog."default",
    scale text COLLATE pg_catalog."default",
    layer_polygon_parts text COLLATE pg_catalog."default",
    included_in_bests text COLLATE pg_catalog."default",
    discretes text COLLATE pg_catalog."default",
    max_resolution_meter text COLLATE pg_catalog."default",
    raw_product_data jsonb,
    product_bbox text COLLATE pg_catalog."default",
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
CREATE INDEX ix_creation_date
    ON records USING btree
    (creation_date ASC NULLS LAST);

-- Index: ix_update_date
-- DROP INDEX ix_update_date;
CREATE INDEX ix_update_date
    ON records USING btree
    (update_date ASC NULLS LAST);

-- Index: ix_source_start_date
-- DROP INDEX ix_source_start_date;
CREATE INDEX ix_source_start_date
    ON records USING btree
    (source_start_date ASC NULLS LAST);

-- Index: ix_source_end_date
-- DROP INDEX ix_source_end_date;
CREATE INDEX ix_source_end_date
    ON records USING btree
    (source_end_date ASC NULLS LAST);

-- Index: ix_max_resolution_meter
-- DROP INDEX ix_max_resolution_meter;
CREATE INDEX ix_max_resolution_meter
    ON records USING btree
    (max_resolution_meter COLLATE pg_catalog."default" ASC NULLS LAST);

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
      NEW.sensor_type, ' ',
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
      COALESCE(NEW.sensor_type, OLD.sensor_type), ' ',
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
      OR NEW.sensor_type IS NOT NULL
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
