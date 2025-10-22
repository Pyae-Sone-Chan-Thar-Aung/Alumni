// CCS Alumni Portal - System Health Check
// Run this script to verify all components and features are working

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Health check results
let healthResults = {
  timestamp: new Date().toISOString(),
  overall: 'UNKNOWN',
  checks: []
};

// Helper function to add check result
function addCheck(name, status, message, details = null) {
  healthResults.checks.push({
    name,
    status, // PASS, FAIL, WARN
    message,
    details,
    timestamp: new Date().toISOString()
  });
  
  console.log(`[${status}] ${name}: ${message}`);
  if (details) {
    console.log(`    Details: ${JSON.stringify(details, null, 2)}`);
  }
}

// Check if file exists
function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    addCheck(`File Check: ${description}`, 'PASS', `File exists: ${filePath}`);
    return true;
  } else {
    addCheck(`File Check: ${description}`, 'FAIL', `File missing: ${filePath}`);
    return false;
  }
}

// Check directory structure
async function checkDirectoryStructure() {
  console.log('\n=== Directory Structure Check ===');
  
  const requiredFiles = [
    { path: 'src/App.js', desc: 'Main App Component' },
    { path: 'src/components/Navbar.js', desc: 'Navigation Component' },
    { path: 'src/components/Footer.js', desc: 'Footer Component' },
    { path: 'src/components/Chatbot.js', desc: 'AI Chatbot Component' },
    { path: 'src/pages/Home.js', desc: 'Home Page' },
    { path: 'src/pages/Login.js', desc: 'Login Page' },
    { path: 'src/pages/Register.js', desc: 'Registration Page' },
    { path: 'src/pages/Gallery.js', desc: 'Gallery Page' },
    { path: 'src/pages/News.js', desc: 'News Page' },
    { path: 'src/pages/AdminDashboard.js', desc: 'Admin Dashboard' },
    { path: 'src/pages/AlumniProfile.js', desc: 'Alumni Profile Page' },
    { path: 'src/pages/TracerStudy.js', desc: 'Tracer Study Form' },
    { path: 'src/context/AuthContext.js', desc: 'Authentication Context' },
    { path: 'public/assets/uic-logo.png', desc: 'UIC Logo' },
    { path: 'package.json', desc: 'Package Configuration' },
    { path: '.env', desc: 'Environment Variables' }
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (!checkFileExists(file.path, file.desc)) {
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// Check database connectivity and tables
async function checkDatabase() {
  console.log('\n=== Database Connectivity Check ===');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    
    addCheck('Database Connection', 'PASS', 'Successfully connected to Supabase');
    
    // Check required tables
    const requiredTables = [
      'users',
      'user_profiles', 
      'pending_registrations',
      'news',
      'job_opportunities',
      'tracer_study_responses',
      'gallery_albums',
      'gallery_images',
      'programs'
    ];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) throw error;
        addCheck(`Table: ${table}`, 'PASS', `Table exists and accessible`);
      } catch (err) {
        addCheck(`Table: ${table}`, 'FAIL', `Table missing or inaccessible: ${err.message}`);
      }
    }
    
    // Check storage buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      addCheck('Storage Buckets', 'FAIL', `Cannot access storage: ${bucketError.message}`);
    } else {
      const requiredBuckets = ['alumni-profiles', 'gallery-images', 'news-images'];
      const existingBuckets = buckets.map(b => b.id);
      
      for (const bucket of requiredBuckets) {
        if (existingBuckets.includes(bucket)) {
          addCheck(`Storage Bucket: ${bucket}`, 'PASS', 'Bucket exists');
        } else {
          addCheck(`Storage Bucket: ${bucket}`, 'WARN', 'Bucket missing - may need to be created');
        }
      }
    }
    
  } catch (error) {
    addCheck('Database Connection', 'FAIL', `Cannot connect to database: ${error.message}`);
    return false;
  }
  
  return true;
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n=== Environment Variables Check ===');
  
  const requiredEnvVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];
  
  let allEnvVarsSet = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      addCheck(`Environment Variable: ${envVar}`, 'PASS', 'Variable is set');
    } else {
      addCheck(`Environment Variable: ${envVar}`, 'FAIL', 'Variable is missing');
      allEnvVarsSet = false;
    }
  }
  
  return allEnvVarsSet;
}

// Check package dependencies
function checkDependencies() {
  console.log('\n=== Dependencies Check ===');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const requiredDeps = [
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons',
      'react-toastify',
      'chart.js',
      'react-chartjs-2',
      'date-fns',
      'axios'
    ];
    
    let allDepsPresent = true;
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        addCheck(`Dependency: ${dep}`, 'PASS', `Version: ${packageJson.dependencies[dep]}`);
      } else {
        addCheck(`Dependency: ${dep}`, 'FAIL', 'Dependency missing');
        allDepsPresent = false;
      }
    }
    
    return allDepsPresent;
  } catch (error) {
    addCheck('Package.json', 'FAIL', `Cannot read package.json: ${error.message}`);
    return false;
  }
}

// Check build readiness
function checkBuildReadiness() {
  console.log('\n=== Build Readiness Check ===');
  
  // Check if build directory exists
  const buildExists = fs.existsSync(path.join(__dirname, 'build'));
  if (buildExists) {
    addCheck('Build Directory', 'PASS', 'Build directory exists');
    
    // Check build files
    const buildFiles = ['index.html', 'static'];
    let buildComplete = true;
    
    for (const file of buildFiles) {
      const filePath = path.join(__dirname, 'build', file);
      if (fs.existsSync(filePath)) {
        addCheck(`Build File: ${file}`, 'PASS', 'File exists in build');
      } else {
        addCheck(`Build File: ${file}`, 'FAIL', 'File missing in build');
        buildComplete = false;
      }
    }
    
    return buildComplete;
  } else {
    addCheck('Build Directory', 'WARN', 'Build directory does not exist - run npm run build');
    return false;
  }
}

// Main health check function
async function runHealthCheck() {
  console.log('🏥 CCS Alumni Portal - System Health Check');
  console.log('==========================================');
  
  const startTime = Date.now();
  
  // Run all checks
  const fileCheck = await checkDirectoryStructure();
  const envCheck = checkEnvironmentVariables();
  const depCheck = checkDependencies();
  const dbCheck = await checkDatabase();
  const buildCheck = checkBuildReadiness();
  
  // Calculate overall status
  const failedChecks = healthResults.checks.filter(c => c.status === 'FAIL').length;
  const warnChecks = healthResults.checks.filter(c => c.status === 'WARN').length;
  const passedChecks = healthResults.checks.filter(c => c.status === 'PASS').length;
  
  if (failedChecks === 0 && warnChecks === 0) {
    healthResults.overall = 'HEALTHY';
  } else if (failedChecks === 0) {
    healthResults.overall = 'HEALTHY_WITH_WARNINGS';
  } else if (failedChecks <= 3) {
    healthResults.overall = 'DEGRADED';
  } else {
    healthResults.overall = 'UNHEALTHY';
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print summary
  console.log('\n==========================================');
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('==========================================');
  console.log(`Overall Status: ${healthResults.overall}`);
  console.log(`Total Checks: ${healthResults.checks.length}`);
  console.log(`✅ Passed: ${passedChecks}`);
  console.log(`⚠️  Warnings: ${warnChecks}`);
  console.log(`❌ Failed: ${failedChecks}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  if (healthResults.overall === 'HEALTHY') {
    console.log('✅ System is ready for deployment!');
  } else {
    console.log('⚠️  Please address the following issues:');
    healthResults.checks
      .filter(c => c.status === 'FAIL')
      .forEach(check => {
        console.log(`   - ${check.name}: ${check.message}`);
      });
  }
  
  // Save results to file
  const reportPath = path.join(__dirname, 'health-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(healthResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return healthResults.overall === 'HEALTHY' || healthResults.overall === 'HEALTHY_WITH_WARNINGS';
}

// Run the health check if this script is executed directly
if (require.main === module) {
  runHealthCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}

module.exports = { runHealthCheck, healthResults };
