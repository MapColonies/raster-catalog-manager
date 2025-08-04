SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Check if product_status column doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'RasterCatalogManager' 
        AND table_name = 'records' 
        AND column_name = 'product_status'
    ) THEN
        RAISE NOTICE 'Column product_status does not exist. Starting migration...';
        
        -- Create the enum type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
            RAISE NOTICE 'Creating product_status enum type...';
            CREATE TYPE product_status AS ENUM ('PUBLISHED', 'UNPUBLISHED');
            RAISE NOTICE 'Product_status enum type created successfully.';
        ELSE
            RAISE NOTICE 'Product_status enum type already exists, skipping creation.';
        END IF;
        
        -- Add the column with default 'UNPUBLISHED'
        RAISE NOTICE 'Adding product_status column to records table...';
        ALTER TABLE "records" 
        ADD COLUMN product_status product_status NOT NULL DEFAULT 'UNPUBLISHED';
        RAISE NOTICE 'Product_status column added successfully with default value UNPUBLISHED.';
        
        -- Update all existing records to 'PUBLISHED'
        RAISE NOTICE 'Updating existing records to PUBLISHED status...';
        UPDATE "records" 
        SET product_status = 'PUBLISHED';
        
        -- Get the count of updated records for logging
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Successfully updated % existing records to PUBLISHED status.', updated_count;
        
        RAISE NOTICE 'Migration completed successfully!';
    ELSE
        RAISE NOTICE 'Column product_status already exists. No migration needed.';
    END IF;
END $$;
