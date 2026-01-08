-- Fix missing columns in Supabase tables
-- Run this in the Supabase SQL Editor to ensure all required columns exist
-- This uses standard lowercase column names to ensure compatibility

-- USERS
alter table users add column if not exists name text;
alter table users add column if not exists email text;
alter table users add column if not exists mobile text;
alter table users add column if not exists password text;
alter table users add column if not exists roles jsonb;
alter table users add column if not exists status text;
alter table users add column if not exists loginname text;
alter table users add column if not exists loginpassword text;
alter table users add column if not exists createdat text;
alter table users add column if not exists createdby text;
alter table users add column if not exists societyid text;
alter table users add column if not exists flatno text;
alter table users add column if not exists wing text;
alter table users add column if not exists photo text;
alter table users add column if not exists isresigned boolean default false;
alter table users add column if not exists securityquestion text;
alter table users add column if not exists securityanswer text;

-- SOCIETIES
alter table societies add column if not exists name text;
alter table societies add column if not exists address text;
alter table societies add column if not exists permissionfromdate text;
alter table societies add column if not exists permissiontodate text;
alter table societies add column if not exists createdby text;
alter table societies add column if not exists createdat text;

-- VISITORS
alter table visitors add column if not exists name text;
alter table visitors add column if not exists gender text;
alter table visitors add column if not exists idproof text;
alter table visitors add column if not exists comingfrom text;
alter table visitors add column if not exists purpose text;
alter table visitors add column if not exists contactnumber text;
alter table visitors add column if not exists residentid text;
alter table visitors add column if not exists societyid text;
alter table visitors add column if not exists status text;
alter table visitors add column if not exists entrytime text;
alter table visitors add column if not exists exittime text;
alter table visitors add column if not exists photo text;
alter table visitors add column if not exists visitorname text;
alter table visitors add column if not exists expecteddate text;
alter table visitors add column if not exists passcode text;
alter table visitors add column if not exists unblockrequestedby text;
alter table visitors add column if not exists blockedby text;
alter table visitors add column if not exists blockeddate text;
alter table visitors add column if not exists unblockrequesteddate text;

-- NOTICES
alter table notices add column if not exists title text;
alter table notices add column if not exists message text;
alter table notices add column if not exists date text;
alter table notices add column if not exists societyid text;
alter table notices add column if not exists createdby text;
alter table notices add column if not exists createdat text;

-- PREAPPROVALS
-- Ensure table exists first (in case of casing issues)
create table if not exists preapprovals (id text primary key);

alter table preapprovals add column if not exists visitorname text;
alter table preapprovals add column if not exists expecteddate text;
alter table preapprovals add column if not exists residentid text;
alter table preapprovals add column if not exists societyid text;
alter table preapprovals add column if not exists passcode text;
alter table preapprovals add column if not exists status text;
alter table preapprovals add column if not exists createdat text;

-- VEHICLES
create table if not exists vehicles (id text primary key);
alter table vehicles add column if not exists residentid text;
alter table vehicles add column if not exists societyid text;
alter table vehicles add column if not exists platenumber text;
alter table vehicles add column if not exists type text;
alter table vehicles add column if not exists make text;
alter table vehicles add column if not exists model text;
alter table vehicles add column if not exists createdat text;

-- COMPLAINTS
create table if not exists complaints (id text primary key);
alter table complaints add column if not exists residentid text;
alter table complaints add column if not exists societyid text;
alter table complaints add column if not exists category text;
alter table complaints add column if not exists subject text;
alter table complaints add column if not exists description text;
alter table complaints add column if not exists status text;
alter table complaints add column if not exists priority text;
alter table complaints add column if not exists createdat text;
alter table complaints add column if not exists assignedto text;

-- AMENITIES
create table if not exists amenities (id text primary key);
alter table amenities add column if not exists societyid text;
alter table amenities add column if not exists name text;
alter table amenities add column if not exists description text;
alter table amenities add column if not exists capacity text;
alter table amenities add column if not exists rules text;
alter table amenities add column if not exists createdat text;

-- BOOKINGS
create table if not exists bookings (id text primary key);
alter table bookings add column if not exists amenityid text;
alter table bookings add column if not exists residentid text;
alter table bookings add column if not exists societyid text;
alter table bookings add column if not exists date text;
alter table bookings add column if not exists slot text;
alter table bookings add column if not exists status text;
alter table bookings add column if not exists createdat text;

-- STAFF (Daily Help / Security / Maintenance Staff)
create table if not exists staff (id text primary key);
alter table staff add column if not exists societyid text;
alter table staff add column if not exists name text;
alter table staff add column if not exists role text;
alter table staff add column if not exists mobile text;
alter table staff add column if not exists photo text;
alter table staff add column if not exists residentid text; -- Linked to resident if daily help
alter table staff add column if not exists isgateallowed boolean;
alter table staff add column if not exists createdat text;

-- PAYMENTS / BILLING
create table if not exists payments (id text primary key);
alter table payments add column if not exists residentid text;
alter table payments add column if not exists societyid text;
alter table payments add column if not exists amount decimal;
alter table payments add column if not exists month text;
alter table payments add column if not exists year text;
alter table payments add column if not exists status text;
alter table payments add column if not exists type text;
alter table payments add column if not exists createdat text;

-- SOS ALERTS
create table if not exists sos_alerts (id text primary key);
alter table sos_alerts add column if not exists residentid text;
alter table sos_alerts add column if not exists societyid text;
alter table sos_alerts add column if not exists status text; -- active, resolved
alter table sos_alerts add column if not exists resolvedby text;
alter table sos_alerts add column if not exists createdat text;
alter table sos_alerts add column if not exists message text;

-- DOCUMENTS / KNOWLEDGE HUB
create table if not exists documents (id text primary key);
alter table documents add column if not exists societyid text;
alter table documents add column if not exists title text;
alter table documents add column if not exists category text; -- Bye-laws, Circulars, Rules
alter table documents add column if not exists url text;
alter table documents add column if not exists createdat text;
