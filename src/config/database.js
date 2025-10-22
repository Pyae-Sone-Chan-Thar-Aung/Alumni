// Database configuration for Supabase (Free PostgreSQL Database)
// Sign up at https://supabase.com for a free account

import supabase from './supabaseClient';

const SUPABASE_CONFIG = {
  // Replace with your Supabase project URL
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co',
  
  // Replace with your Supabase anon key
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // Database tables structure
  TABLES: {
    USERS: 'users',
    NEWS: 'news',
    JOB_OPPORTUNITIES: 'job_opportunities',
    BATCH_GROUPS: 'batch_groups',
    BATCH_MESSAGES: 'batch_messages',
    USER_PROFILES: 'user_profiles'
  }
};

// Database schema for reference
const DATABASE_SCHEMA = {
  users: `
    CREATE TABLE users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni')),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      batch_year INTEGER,
      course VARCHAR(100),
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  user_profiles: `
    CREATE TABLE user_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      phone VARCHAR(20),
      address TEXT,
      current_job VARCHAR(255),
      company VARCHAR(255),
      bio TEXT,
      profile_image_url VARCHAR(500),
      linkedin_url VARCHAR(500),
      github_url VARCHAR(500),
      website_url VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  news: `
    CREATE TABLE news (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      author_id UUID REFERENCES users(id),
      is_published BOOLEAN DEFAULT FALSE,
      published_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  job_opportunities: `
    CREATE TABLE job_opportunities (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      job_type VARCHAR(50) CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
      salary_range VARCHAR(100),
      description TEXT NOT NULL,
      requirements TEXT,
      contact_email VARCHAR(255),
      contact_phone VARCHAR(20),
      application_deadline DATE,
      posted_by UUID REFERENCES users(id),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  batch_groups: `
    CREATE TABLE batch_groups (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      batch_year INTEGER NOT NULL,
      course VARCHAR(100) NOT NULL,
      group_name VARCHAR(255) NOT NULL,
      description TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  batch_messages: `
    CREATE TABLE batch_messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      batch_group_id UUID REFERENCES batch_groups(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES users(id),
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
};

// Helper functions for database operations
const DatabaseService = {
  // Initialize Supabase client
  initSupabase: () => supabase,
  
  // Mock data for development
  getMockData: () => ({
    users: [
      {
        id: '1',
        email: 'admin@uic.edu.ph',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        batch_year: 2020,
        course: 'BS Computer Science'
      },
      {
        id: '2',
        email: 'alumni@uic.edu.ph',
        role: 'alumni',
        first_name: 'John',
        last_name: 'Doe',
        batch_year: 2020,
        course: 'BS Computer Science'
      }
    ],
    
    news: [
      {
        id: '1',
        title: 'UIC Alumni Homecoming 2024',
        content: 'Join us for the annual UIC Alumni Homecoming celebration...',
        author_id: '1',
        is_published: true,
        published_at: new Date().toISOString()
      }
    ],
    
    job_opportunities: [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'Davao City',
        job_type: 'Full-time',
        salary_range: '₱80,000 - ₱120,000',
        description: 'Looking for experienced software engineer...',
        requirements: 'React, Node.js, AWS, 5+ years experience',
        is_active: true
      }
    ]
  })
};

export { SUPABASE_CONFIG, DATABASE_SCHEMA, DatabaseService };
