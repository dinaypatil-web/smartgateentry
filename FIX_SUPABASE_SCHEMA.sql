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
