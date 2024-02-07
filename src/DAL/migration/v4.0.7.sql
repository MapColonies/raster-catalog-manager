SET search_path TO public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
ALTER TABLE "records" 
	ADD CONSTRAINT records_product_id_check CHECK (product_id ~* '^[a-zA-Z0-9_-]+$'),
    ADD CONSTRAINT records_max_resolution_deg_check CHECK (max_resolution_deg BETWEEN 0.00000009 AND 0.072),
    ADD CONSTRAINT records_min_horizontal_accuracy_ce_90_check CHECK (min_horizontal_accuracy_ce_90 BETWEEN 0.01 AND 4000),
    ADD CONSTRAINT records_classification_check CHECK (classification ~* '^[3-6]$'),
    ADD CONSTRAINT records_scale_check CHECK (scale BETWEEN 0 AND 100000000),
    ADD CONSTRAINT records_max_resolution_meter_check CHECK (max_resolution_meter BETWEEN 0.01 AND 8000),
    ADD CONSTRAINT records_product_bbox_check CHECK (product_bbox ~* '^-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?),-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?),-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?),-?((0|[1-9]\d?|1[0-7]\d)(\.\d*)?|180(\.0*)?)$');