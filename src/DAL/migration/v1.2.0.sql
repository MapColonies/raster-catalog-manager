ALTER TABLE public.records
    ADD COLUMN max_resolution_meter VARCHAR(10),
    ADD COLUMN raw_product_data jsonb,
    ADD COLUMN product_bbox VARCHAR(255);
