-- Create database if not exists
SELECT 'CREATE DATABASE personnel_management'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'personnel_management')\gexec

-- Connect to the database
\c personnel_management;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initial data will be created by Sequelize sync
-- This file can be extended with initial seed data if needed