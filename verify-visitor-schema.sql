-- Verify and fix visitor table schema for complete field support
-- Run this in Supabase SQL Editor

-- 1. Check current visitor table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'visitors' 
ORDER BY column_name;

-- 2. Ensure all required columns exist
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS id text PRIMARY KEY;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS contactnumber text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS idproof text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS comingfrom text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS entrytime text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS exittime text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS photo text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS createdby text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS createdat text;

-- 3. Check for any existing visitors with missing data
SELECT 
    COUNT(*) as total_visitors,
    COUNT(name) as has_name,
    COUNT(gender) as has_gender,
    COUNT(contactnumber) as has_contact,
    COUNT(idproof) as has_idproof,
    COUNT(comingfrom) as has_comingfrom,
    COUNT(purpose) as has_purpose,
    COUNT(residentid) as has_residentid,
    COUNT(societyid) as has_societyid,
    COUNT(photo) as has_photo
FROM visitors;

-- 4. Show sample of recent visitors to verify data structure
SELECT 
    id,
    name,
    gender,
    contactnumber,
    idproof,
    comingfrom,
    purpose,
    residentid,
    societyid,
    status,
    entrytime,
    CASE 
        WHEN photo IS NULL THEN 'No photo'
        WHEN photo = '' THEN 'Empty photo'
        WHEN photo LIKE 'data:image/%' THEN 'Has photo (' || LENGTH(photo) || ' chars)'
        ELSE 'Invalid photo format'
    END as photo_status,
    createdby,
    createdat
FROM visitors 
ORDER BY createdat DESC 
LIMIT 5;

-- 5. Check for any visitors with missing critical fields
SELECT 
    id,
    name,
    residentid,
    societyid,
    status,
    entrytime,
    CASE 
        WHEN name IS NULL OR name = '' THEN 'Missing name'
        WHEN residentid IS NULL OR residentid = '' THEN 'Missing residentid'
        WHEN societyid IS NULL OR societyid = '' THEN 'Missing societyid'
        WHEN status IS NULL OR status = '' THEN 'Missing status'
        WHEN entrytime IS NULL OR entrytime = '' THEN 'Missing entrytime'
        ELSE 'OK'
    END as data_status
FROM visitors 
WHERE name IS NULL OR name = '' 
   OR residentid IS NULL OR residentid = ''
   OR societyid IS NULL OR societyid = ''
   OR status IS NULL OR status = ''
   OR entrytime IS NULL OR entrytime = ''
ORDER BY createdat DESC;

-- 6. Enable realtime for visitors table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;

-- 7. Disable RLS for development (optional - enable in production)
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;

-- 8. Create an index on frequently queried fields for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_societyid ON visitors(societyid);
CREATE INDEX IF NOT EXISTS idx_visitors_residentid ON visitors(residentid);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_entrytime ON visitors(entrytime);

-- 9. Final verification - show complete table structure
\d visitors;