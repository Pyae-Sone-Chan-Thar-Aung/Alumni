/**
 * Test rejection email
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRejectionEmail() {
  console.log('🧪 Testing REJECTION email...\n');

  try {
    const testEmail = {
      to: 'kalaylay.ktg@gmail.com',
      subject: 'Update on Your CCS Alumni Registration',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>CCS Alumni Registration Update</h1>
              </div>
              <div class="content">
                <p>Dear Test User,</p>
                
                <p>Thank you for your interest in joining the <strong>UIC CCS Alumni Portal</strong>.</p>
                
                <div class="alert">
                  <p><strong>⚠️ Registration Status:</strong> Unfortunately, we were unable to approve your registration at this time.</p>
                </div>
                
                <p>This may be due to:</p>
                <ul>
                  <li>Incomplete or incorrect information provided</li>
                  <li>Unable to verify your alumni status</li>
                  <li>Technical issues with the submission</li>
                </ul>
                
                <p><strong>What you can do:</strong></p>
                <ul>
                  <li>Double-check your information and try registering again</li>
                  <li>Contact the alumni office for assistance</li>
                  <li>Provide additional verification documents if needed</li>
                </ul>
                
                <center>
                  <a href="http://localhost:3000/register" class="button">
                    Register Again
                  </a>
                </center>
                
                <p>If you believe this is a mistake or need further clarification, please contact the alumni office.</p>
                
                <p>Best regards,<br>
                <strong>UIC CCS Alumni Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} UIC College of Computer Studies</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    console.log('📧 Sending REJECTION email to:', testEmail.to);
    console.log('📬 Subject:', testEmail.subject);
    console.log('');

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: testEmail
    });

    if (error) {
      console.error('❌ Error:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } else if (data && data.success) {
      console.log('✅ Rejection email sent successfully!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎉 SUCCESS! Check email inbox (and spam folder).');
    } else {
      console.log('⚠️ Unexpected response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testRejectionEmail();
