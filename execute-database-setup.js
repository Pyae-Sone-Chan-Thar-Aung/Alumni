/**
 * Execute Complete Database Setup Script
 * This script executes the complete-database-setup.sql file to create storage buckets
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 UIC Alumni Portal - Database Setup Execution');
console.log('='.repeat(60));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeStorageBucketCreation() {
  try {
    console.log('\n🔍 Attempting to create storage buckets...');
    
    // First, try to just create the buckets using the insert statement
    const bucketInsertSQL = `
      INSERT INTO storage.buckets (id, name, public)
      VALUES 
        ('alumni-profiles', 'alumni-profiles', true),
        ('gallery-images', 'gallery-images', true),
        ('news-images', 'news-images', true),
        ('documents', 'documents', false)
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log('📝 Executing storage bucket creation SQL...');
    
    // Try executing via RPC call with SQL
    try {
      const { data, error } = await supabase.rpc('exec', { 
        sql: bucketInsertSQL 
      });
      
      if (error) {
        console.log(`❌ RPC execution failed: ${error.message}`);
        return await tryAlternativeMethod();
      }
      
      console.log('✅ Storage buckets created successfully via RPC');
      return true;
      
    } catch (rpcError) {
      console.log(`❌ RPC method failed: ${rpcError.message}`);
      return await tryAlternativeMethod();
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return await tryAlternativeMethod();
  }
}

async function tryAlternativeMethod() {
  console.log('\n🔄 Trying alternative method...');
  
  try {
    // Check current bucket status
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Cannot access storage: ${error.message}`);
      return false;
    }
    
    const requiredBuckets = ['alumni-profiles', 'gallery-images', 'news-images', 'documents'];
    const existingBuckets = buckets.map(b => b.name);
    const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
    
    console.log(`\n📊 BUCKET STATUS:`);
    console.log(`✅ Existing buckets (${existingBuckets.length}): ${existingBuckets.join(', ') || 'none'}`);
    console.log(`❌ Missing buckets (${missingBuckets.length}): ${missingBuckets.join(', ') || 'none'}`);
    
    if (missingBuckets.length === 0) {
      console.log('\n🎉 All required storage buckets already exist!');
      return true;
    }
    
    // Provide manual instructions
    console.log('\n📝 MANUAL CREATION REQUIRED:');
    console.log('Since programmatic creation is restricted, please create buckets manually:');
    console.log('\n🌐 Option 1: Supabase Dashboard');
    console.log('   1. Go to: https://supabase.com/dashboard/project/sgalzbhfpydwnvprxrln/storage/buckets');
    console.log('   2. Click "New bucket" for each missing bucket:');
    missingBuckets.forEach(bucket => {
      const isPublic = bucket !== 'documents';
      console.log(`      - Name: "${bucket}", Public: ${isPublic}`);
    });
    
    console.log('\n💻 Option 2: SQL Editor');
    console.log('   1. Go to: https://supabase.com/dashboard/project/sgalzbhfpydwnvprxrln/sql');
    console.log('   2. Run this SQL:');
    console.log('   ```sql');
    console.log('   INSERT INTO storage.buckets (id, name, public) VALUES');
    requiredBuckets.forEach((bucket, index) => {
      const isPublic = bucket !== 'documents';
      const comma = index < requiredBuckets.length - 1 ? ',' : '';
      console.log(`     ('${bucket}', '${bucket}', ${isPublic})${comma}`);
    });
    console.log('   ON CONFLICT (id) DO NOTHING;');
    console.log('   ```');
    
    return false;
    
  } catch (error) {
    console.log(`❌ Alternative method failed: ${error.message}`);
    return false;
  }
}

async function verifyStorageBuckets() {
  try {
    console.log('\n🧪 Verifying storage buckets...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Verification failed: ${error.message}`);
      return false;
    }
    
    const requiredBuckets = ['alumni-profiles', 'gallery-images', 'news-images', 'documents'];
    const existingBuckets = buckets.map(b => b.name);
    const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
    
    if (missingBuckets.length === 0) {
      console.log('✅ All storage buckets verified successfully!');
      console.log(`📋 Available buckets: ${existingBuckets.join(', ')}`);
      return true;
    } else {
      console.log(`❌ Still missing buckets: ${missingBuckets.join(', ')}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Verification error: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('\n🚀 Starting database setup execution...\n');
    
    // Try to create storage buckets
    const success = await executeStorageBucketCreation();
    
    if (success) {
      // Verify the buckets were created
      const verified = await verifyStorageBuckets();
      
      if (verified) {
        console.log('\n🎊 Storage buckets setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Run: node test-all-features.js');
        console.log('   2. Verify the Storage System test passes');
      }
    } else {
      console.log('\n⚠️ Manual intervention required to create storage buckets.');
      console.log('   Follow the instructions above, then run this script again to verify.');
    }
    
  } catch (error) {
    console.error('\n💥 Critical error:', error.message);
    process.exit(1);
  }
}

main();