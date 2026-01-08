-- COMPREHENSIVE SUPABASE SCHEMA FIX
-- Run this in the Supabase SQL Editor to ensure all tables and columns exist and are correctly configured.
-- This script uses standard lowercase column names for maximum compatibility with Supabase/Postgres.

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';
ALTER TABLE users ADD COLUMN IF NOT EXISTS loginname text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS createdat text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS isresigned boolean DEFAULT false;

-- 2. SOCIETIES TABLE
CREATE TABLE IF NOT EXISTS societies (id text PRIMARY KEY);
ALTER TABLE societies ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE societies ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE societies ADD COLUMN IF NOT EXISTS permissionfromdate text;
ALTER TABLE societies ADD COLUMN IF NOT EXISTS permissiontodate text;
ALTER TABLE societies ADD COLUMN IF NOT EXISTS createdby text;
ALTER TABLE societies ADD COLUMN IF NOT EXISTS createdat text;

-- 3. VISITORS TABLE
CREATE TABLE IF NOT EXISTS visitors (id text PRIMARY KEY);
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS contactnumber text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS entrytime text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS exittime text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS idproof text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS comingfrom text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS visitorname text; -- For pre-approvals converted to visitors
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS expecteddate text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS passcode text;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS createdat text;

-- 4. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (id text PRIMARY KEY);
ALTER TABLE notices ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal';
ALTER TABLE notices ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS createdby text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS createdat text;

-- 5. PRE-APPROVALS TABLE (Stored as 'preapprovals')
CREATE TABLE IF NOT EXISTS preapprovals (id text PRIMARY KEY);
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS visitorname text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS contactnumber text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS expecteddate text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS passcode text;
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS status text DEFAULT 'valid';
ALTER TABLE preapprovals ADD COLUMN IF NOT EXISTS createdat text;

-- 6. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (id text PRIMARY KEY);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS platenumber text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS type text; -- Car, Bike, etc.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS createdat text;

-- 7. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (id text PRIMARY KEY);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assignedto text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS createdat text;

-- 8. AMENITIES TABLE
CREATE TABLE IF NOT EXISTS amenities (id text PRIMARY KEY);
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS capacity text;
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS createdat text;

-- 9. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (id text PRIMARY KEY);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amenityid text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text DEFAULT 'confirmed';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS createdat text;

-- 10. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (id text PRIMARY KEY);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS isgateallowed boolean DEFAULT true;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS residentid text; -- For daily help tied to a resident
ALTER TABLE staff ADD COLUMN IF NOT EXISTS createdat text;

-- 11. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (id text PRIMARY KEY);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount decimal;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS month text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS year text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS type text; -- Maintenance, Special, etc.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS createdat text;

-- 12. SOS ALERTS TABLE
CREATE TABLE IF NOT EXISTS sos_alerts (id text PRIMARY KEY);
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS residentid text;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'; -- active, resolved
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS resolvedby text;
ALTER TABLE sos_alerts ADD COLUMN IF NOT EXISTS createdat text;

-- 13. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (id text PRIMARY KEY);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS societyid text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS createdat text;

-- 14. ENABLE REALTIME
-- First, try to remove existing publication to avoid duplication errors (optional)
-- DROP PUBLICATION IF EXISTS supabase_realtime;
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES; 
-- Or specifically:
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE notices;
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- 15. DISABLE RLS (Optional for Dev/Demo - Use with caution)
-- Supabase tables have RLS enabled by default. If no policies are set, you won't see data.
-- Run these for any tables you want to be publicly accessible for development:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE societies DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE preapprovals DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE amenities DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
