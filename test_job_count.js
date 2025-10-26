// Test job opportunities count
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testJobCount() {
  console.log('🔍 Testing Job Opportunities Count...\n');

  try {
    // Test 1: Count all jobs (no auth)
    console.log('1️⃣ Counting ALL job opportunities (no filter, no auth)...');
    const { count: allJobs, error: allError } = await supabase
      .from('job_opportunities')
      .select('*', { count: 'exact', head: true });
    
    if (allError) {
      console.error('❌ Error:', allError.message);
    } else {
      console.log(`✅ Total jobs in database: ${allJobs || 0}`);
    }

    // Test 2: Count active jobs only
    console.log('\n2️⃣ Counting ACTIVE job opportunities only...');
    const { count: activeJobs, error: activeError } = await supabase
      .from('job_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (activeError) {
      console.error('❌ Error:', activeError.message);
    } else {
      console.log(`✅ Active jobs: ${activeJobs || 0}`);
    }

    // Test 3: Get sample job data
    console.log('\n3️⃣ Fetching sample job records...');
    const { data: sampleJobs, error: sampleError } = await supabase
      .from('job_opportunities')
      .select('id, title, company, is_active, created_at')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Error:', sampleError.message);
    } else {
      console.log(`✅ Found ${sampleJobs?.length || 0} sample jobs:`);
      if (sampleJobs && sampleJobs.length > 0) {
        sampleJobs.forEach(job => {
          console.log(`  - ${job.title} at ${job.company} (Active: ${job.is_active})`);
        });
      } else {
        console.log('  ⚠️  No jobs found in database');
      }
    }

    // Test 4: Check RLS policies
    console.log('\n4️⃣ Checking for RLS restrictions...');
    const { data: jobsWithoutHead, error: rlsError } = await supabase
      .from('job_opportunities')
      .select('id')
      .limit(1);
    
    if (rlsError) {
      console.error('❌ RLS Error detected:', rlsError.message);
      console.log('   This suggests RLS policies might be blocking anonymous access');
    } else if (jobsWithoutHead && jobsWithoutHead.length > 0) {
      console.log('✅ RLS allows anonymous access');
    } else {
      console.log('⚠️  No jobs returned (might be RLS or no data)');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(60));
    if (allJobs === 0 && activeJobs === 0) {
      console.log('❌ No jobs in database - need to add job opportunities');
    } else if (allError || activeError) {
      console.log('❌ RLS policy is blocking access');
      console.log('💡 SOLUTION: Update RLS policy to allow public read access');
    } else {
      console.log(`✅ Jobs are accessible: ${activeJobs} active out of ${allJobs} total`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testJobCount().then(() => {
  console.log('\n🏁 Test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
