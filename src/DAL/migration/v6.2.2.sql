  SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

ALTER TABLE "records" 
  ALTER COLUMN min_horizontal_accuracy_ce_90 TYPE numeric USING (min_horizontal_accuracy_ce_90::numeric),
  ALTER COLUMN max_horizontal_accuracy_ce_90 TYPE numeric USING (max_horizontal_accuracy_ce_90::numeric)