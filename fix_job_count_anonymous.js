const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixJobCountForAnonymous() {
  console.log('🔧 Fixing job opportunities visibility for anonymous users...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./fix_job_count_for_anonymous.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { data, error } = await supabase.rpc('exec_sql', { 
          query: statement + ';' 
        });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log('\n🎉 SQL fix completed!\n');
    console.log('Testing anonymous access to job opportunities...\n');

    // Test: Try to fetch job opportunities count as anonymous user
    const { count, error } = await supabase
      .from('job_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching job count:', error.message);
      console.log('\n⚠️  The RLS policy may need to be updated manually via Supabase Dashboard.');
      console.log('Go to: Database > Tables > job_opportunities > RLS Policies');
      console.log('Create a policy:');
      console.log('  Name: Public can view active job opportunities');
      console.log('  Command: SELECT');
      console.log('  Target roles: public');
      console.log('  USING expression: is_active = true');
    } else {
      console.log(`✅ Success! Anonymous users can now see ${count} active job opportunities\n`);
      console.log('The home page will now show the correct job count for all visitors!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual fix required:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Database > Tables > job_opportunities');
    console.log('4. Click on "RLS Policies" tab');
    console.log('5. Delete the existing "Anyone can view active job opportunities" policy');
    console.log('6. Create a new policy:');
    console.log('   - Name: Public can view active job opportunities');
    console.log('   - Policy Command: SELECT');
    console.log('   - Target roles: public');
    console.log('   - USING expression: is_active = true');
  }
}

fixJobCountForAnonymous();
