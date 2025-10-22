const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cnjdmddqwfryvqnhirkb.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamRtZGRxd2ZyeXZxbmhpcmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzEsImV4cCI6MjA1MDU1MDk3MX0.8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filename) {
  try {
    console.log(`📁 Reading SQL file: ${filename}`);
    const sqlContent = fs.readFileSync(filename, 'utf8');
    
    console.log('🚀 Executing SQL script...');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Execution Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All SQL statements executed successfully!');
    } else {
      console.log('\n⚠️ Some statements had errors. Check the output above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to execute SQL file:', error.message);
  }
}

// Check if filename is provided as command line argument
const filename = process.argv[2];

if (!filename) {
  console.log('Usage: node execute-sql.js <filename.sql>');
  console.log('Example: node execute-sql.js fix_messaging_system_tables.sql');
  process.exit(1);
}

if (!fs.existsSync(filename)) {
  console.error(`❌ File not found: ${filename}`);
  process.exit(1);
}

executeSQLFile(filename);
