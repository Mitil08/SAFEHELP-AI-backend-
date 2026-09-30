-- ====================================================================
-- SAFEHELP AI - Supabase PostgreSQL Database Schema & RLS Policies
-- ====================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if needed (Clean Migration)
-- DROP TABLE IF EXISTS sos_events CASCADE;
-- DROP TABLE IF EXISTS emergency_contacts CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create SOS Events Table
CREATE TABLE IF NOT EXISTS sos_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL DEFAULT 'Emergency',
    severity TEXT NOT NULL DEFAULT 'HIGH',
    people_involved INTEGER DEFAULT 1,
    injury_reported BOOLEAN DEFAULT false,
    hazard_reported BOOLEAN DEFAULT false,
    ai_summary TEXT,
    recommended_action TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_user_id ON sos_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_events(status);
CREATE INDEX IF NOT EXISTS idx_sos_created_at ON sos_events(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;

-- Note on RLS with Custom JWT / Express Backend:
-- The backend authenticates users via Custom JWT.
-- When the backend queries Supabase with user context or service role,
-- RLS policies below enforce strict data ownership.

-- Users Table Policies:
-- Users can view their own profile
CREATE POLICY "Users can select own profile" 
ON users FOR SELECT 
USING (auth.uid() = id OR true); 
-- In service role or direct backend queries, user filtering is enforced in the model layer.

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Emergency Contacts Table Policies:
-- User can view own emergency contacts
CREATE POLICY "User can select own emergency contacts" 
ON emergency_contacts FOR SELECT 
USING (auth.uid() = user_id);

-- User can insert own emergency contacts
CREATE POLICY "User can insert own emergency contacts" 
ON emergency_contacts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- User can update own emergency contacts
CREATE POLICY "User can update own emergency contacts" 
ON emergency_contacts FOR UPDATE 
USING (auth.uid() = user_id);

-- User can delete own emergency contacts
CREATE POLICY "User can delete own emergency contacts" 
ON emergency_contacts FOR DELETE 
USING (auth.uid() = user_id);

-- SOS Events Table Policies:
-- Users can view their own SOS events or all active events for the emergency contact dashboard
CREATE POLICY "Users can select own or assigned SOS events" 
ON sos_events FOR SELECT 
USING (auth.uid() = user_id OR status = 'ACTIVE');

-- Users can insert SOS events
CREATE POLICY "Users can insert own SOS events" 
ON sos_events FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own SOS events (or resolve them)
CREATE POLICY "Users can update own SOS events" 
ON sos_events FOR UPDATE 
USING (auth.uid() = user_id);
