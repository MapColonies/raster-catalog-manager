

SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

--remove columns
ALTER TABLE "records" DROP COLUMN discretes;
ALTER TABLE "records" DROP COLUMN included_in_bests;
ALTER TABLE "records" DROP COLUMN layer_polygon_parts;
ALTER TABLE "records" DROP COLUMN raw_product_data;

--rename columns
ALTER TABLE "records" RENAME COLUMN creation_date TO creation_date_utc;
ALTER TABLE "records" RENAME COLUMN update_date TO update_date_utc;
ALTER TABLE "records" RENAME COLUMN source_start_date TO imaging_time_begin_utc;
ALTER TABLE "records" RENAME COLUMN source_end_date TO imaging_time_end_utc;

--add columns
ALTER TABLE "records" ADD COLUMN min_resolution_deg numeric CHECK (min_resolution_deg BETWEEN 0.000000167638063430786 AND 0.703125);
UPDATE "records" r SET min_resolution_deg = o.max_resolution_deg
FROM (
	SELECT identifier, max_resolution_deg FROM "records"
  ) as o
WHERE r.identifier = o.identifier;
ALTER TABLE "records" ALTER min_resolution_deg SET NOT NULL;

ALTER TABLE "records" ADD COLUMN min_resolution_meter numeric CHECK (min_resolution_meter BETWEEN 0.0185 AND 78271.52);
UPDATE "records" r SET min_resolution_meter = o.max_resolution_meter
FROM (
	SELECT identifier, max_resolution_meter FROM "records"
  ) as o
WHERE r.identifier = o.identifier;
ALTER TABLE "records" ALTER min_resolution_meter SET NOT NULL;

ALTER TABLE "records" ADD COLUMN max_horizontal_accuracy_ce_90 real CHECK (max_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000);
UPDATE "records" r SET max_horizontal_accuracy_ce_90 = o.min_horizontal_accuracy_ce_90
FROM (
	SELECT identifier, min_horizontal_accuracy_ce_90 FROM "records"
  ) as o
WHERE r.identifier = o.identifier;
ALTER TABLE "records" ALTER max_horizontal_accuracy_ce_90 SET NOT NULL;

--change constarints
--ALTER TABLE "records" DROP CONSTRAINT max_resolution_deg;
ALTER TABLE "records" DROP CONSTRAINT records_max_resolution_deg_check;
--ALTER TABLE "records" DROP CONSTRAINT max_resolution_meter;
ALTER TABLE "records" DROP CONSTRAINT records_max_resolution_meter_check;
--ALTER TABLE "records" DROP CONSTRAINT min_horizontal_accuracy_ce_90;
ALTER TABLE "records" DROP CONSTRAINT records_min_horizontal_accuracy_ce_90_check;

--classification constraint check
ALTER TABLE "records" DROP CONSTRAINT IF EXISTS records_classification_check;
ALTER TABLE "records"
ADD CONSTRAINT records_classification_check
CHECK (classification ~* '^[0-9]$|^[1-9][0-9]$|^(100)$');
ALTER TABLE records
ALTER COLUMN classification SET NOT NULL;

--region constraint
ALTER TABLE records
ALTER COLUMN region SET NOT NULL;
-- Add a check constraint to ensure the region is not an empty string
ALTER TABLE records
ADD CONSTRAINT check_region_not_empty
CHECK (region <> '');


ALTER TABLE "records" 
		ADD CONSTRAINT records_max_resolution_deg_check CHECK (max_resolution_deg BETWEEN 000000167638063430786 AND 0.703125),
    	ADD CONSTRAINT records_min_horizontal_accuracy_ce_90_check CHECK (min_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000),
    	ADD CONSTRAINT records_max_resolution_meter_check CHECK (max_resolution_meter BETWEEN 0.0185 AND 78271.52);


--change indexes
-- Index: ix_creation_date - now ix_update_date_utc
DROP INDEX ix_creation_date;
CREATE INDEX ix_creation_date_utc
    ON records USING btree
    (creation_date_utc ASC NULLS LAST);

-- Index: ix_update_date - now ix_update_date_utc
DROP INDEX ix_update_date;
CREATE INDEX ix_update_date_utc
    ON records USING btree
    (update_date_utc ASC NULLS LAST);

-- Index: ix_source_start_date - now ix_imaging_time_begin_utc
DROP INDEX ix_source_start_date;
CREATE INDEX ix_imaging_time_begin_utc
    ON records USING btree
    (imaging_time_begin_utc ASC NULLS LAST);

-- Index: ix_source_end_date -now ix_imaging_time_end_utc
DROP INDEX ix_source_end_date;
CREATE INDEX ix_imaging_time_end_utc
    ON records USING btree
    (imaging_time_end_utc ASC NULLS LAST);

-- Index: ix_min_resolution_meter
-- DROP INDEX ix_min_resolution_meter;
CREATE INDEX ix_min_resolution_meter
    ON records USING btree
    (min_resolution_meter ASC);      

