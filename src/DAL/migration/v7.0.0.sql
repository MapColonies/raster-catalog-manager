SET search_path TO "RasterCatalogManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

DO $$
BEGIN
    -- Check if product_status column doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'RasterCatalogManager' 
        AND table_name = 'records' 
        AND column_name = 'product_status'
    ) THEN
        -- Create the enum type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
            CREATE TYPE product_status AS ENUM ('PUBLISHED', 'UNPUBLISHED');
        END IF;
        
        -- Add the column with default 'UNPUBLISHED'
        ALTER TABLE "records" 
        ADD COLUMN product_status product_status NOT NULL DEFAULT 'UNPUBLISHED';
        
        -- Update all existing records to 'PUBLISHED'
        UPDATE "records" 
        SET product_status = 'PUBLISHED';
    END IF;
END $$;
