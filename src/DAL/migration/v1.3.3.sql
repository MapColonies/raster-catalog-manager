ALTER TABLE public."records"
    ADD CONSTRAINT unique_record_values UNIQUE (product_id, product_version, product_type);