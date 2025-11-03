/**
 * Test script for email notification system
 * 
 * This script tests the email service locally before deploying
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmailFunction() {
  console.log('🧪 Testing email notification system...\n');

  try {
    // Test data
    const testEmail = {
      to: 'kalaylay.ktg@gmail.com', // Replace with your actual email
      subject: '✅ Test Email from CCS Alumni Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Email System Test</h1>
              </div>
              <div class="content">
                <p>Congratulations! Your email notification system is working correctly.</p>
                <p>This test was triggered from the CCS Alumni Portal email service.</p>
                <p><strong>System Status:</strong> ✅ Operational</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    console.log('📧 Sending test email to:', testEmail.to);
    console.log('📬 Subject:', testEmail.subject);
    console.log('');

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: testEmail
    });

    if (error) {
      console.error('❌ Error calling edge function:', error);
      throw error;
    }

    if (data && data.success) {
      console.log('✅ Email sent successfully!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎉 SUCCESS! Check your email inbox (and spam folder).');
    } else {
      console.log('⚠️ Function responded but email may not have been sent');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Make sure the edge function is deployed: npx supabase functions deploy send-email');
    console.error('   2. Verify secrets are set: npx supabase secrets list');
    console.error('   3. Check your Resend API key is valid');
    console.error('   4. Replace "your-email@example.com" with a real email address');
  }
}

// Run the test
testEmailFunction();
