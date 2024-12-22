  SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

ALTER TABLE "records" 
  ALTER COLUMN min_horizontal_accuracy_ce_90 TYPE numeric USING (min_horizontal_accuracy_ce_90::numeric),
  ALTER COLUMN max_horizontal_accuracy_ce_90 TYPE numeric USING (max_horizontal_accuracy_ce_90::numeric),
  DROP CONSTRAINT records_min_horizontal_accuracy_ce_90_check,
  DROP CONSTRAINT records_max_horizontal_accuracy_ce_90_check,
  ADD CONSTRAINT records_min_horizontal_accuracy_ce_90_check CHECK (min_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000),
  ADD CONSTRAINT records_max_horizontal_accuracy_ce_90_check CHECK (min_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000);
