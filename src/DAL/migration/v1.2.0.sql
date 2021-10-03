ALTER TABLE public.records
    ADD COLUMN max_resolution_meter numeric(6, 2),
    ADD COLUMN raw_product_data jsonb;
