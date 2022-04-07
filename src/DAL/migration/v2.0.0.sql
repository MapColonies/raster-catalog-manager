SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

DROP INDEX ix_max_resolution_meter;

ALTER TABLE "records" 
  ALTER COLUMN resolution TYPE numeric USING (resolution::numeric),
  ALTER COLUMN resolution SET NOT NULL,
  ALTER COLUMN horizontal_accuracy_ce_90 TYPE real USING (horizontal_accuracy_ce_90::real),
  ALTER COLUMN sensor_type SET NOT NULL,
  ALTER COLUMN scale TYPE integer USING (scale::integer),
  ALTER COLUMN max_resolution_meter TYPE numeric USING (max_resolution_meter::numeric),
  ALTER COLUMN max_resolution_meter SET NOT NULL;
  
ALTER TABLE "records" RENAME COLUMN resolution TO max_resolution_deg;
ALTER TABLE "records" RENAME COLUMN horizontal_accuracy_ce_90 TO min_horizontal_accuracy_ce_90;
ALTER TABLE "records" RENAME COLUMN sensor_type TO sensors;

CREATE INDEX ix_max_resolution_meter
    ON records USING btree
    (max_resolution_meter ASC);

DROP TRIGGER ftsupdate ON records;
DROP FUNCTION IF EXISTS records_update_anytext();
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
