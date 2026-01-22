-- Ensure Photo Column Exists in Visitors Table
-- Run this in Supabase SQL Editor

-- Check if photo column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'visitors' 
        AND column_name = 'photo'
    ) THEN
        -- Add photo column if it doesn't exist
        ALTER TABLE visitors ADD COLUMN photo text;
        RAISE NOTICE 'Photo column added to visitors table';
    ELSE
        RAISE NOTICE 'Photo column already exists in visitors table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'visitors' 
AND column_name = 'photo';

-- Check if there are any visitors with photos
SELECT 
    COUNT(*) as total_visitors,
    COUNT(photo) as visitors_with_photos,
    COUNT(CASE WHEN photo IS NOT NULL AND photo LIKE 'data:image/%' THEN 1 END) as visitors_with_valid_photos
FROM visitors;

-- Show sample of recent visitors with photo status
SELECT 
    id,
    name,
    CASE 
        WHEN photo IS NULL THEN 'No photo'
        WHEN photo = '' THEN 'Empty photo'
        WHEN photo LIKE 'data:image/%' THEN 'Valid photo (' || LENGTH(photo) || ' chars)'
        ELSE 'Invalid photo format'
    END as photo_status,
    createdat
FROM visitors 
ORDER BY createdat DESC 
LIMIT 10;