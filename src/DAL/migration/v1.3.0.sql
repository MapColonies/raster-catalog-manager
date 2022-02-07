SET SCHEMA 'public'; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE records
    ADD COLUMN product_sub_type text COLLATE pg_catalog."default",
    ALTER COLUMN max_resolution_meter TYPE text COLLATE pg_catalog."default",
    ALTER COLUMN product_bbox TYPE text COLLATE pg_catalog."default";

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


DROP TRIGGER ftsupdate ON records;
DROP FUNCTION IF EXISTS records_update_anytext();
-- Trigger function : records_update_anytext
CREATE FUNCTION records_update_anytext() RETURNS trigger
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
      NEW.srs_name, ' '
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
