/**
 * Email Service for sending approval/rejection notifications
 * 
 * This service integrates with Supabase Edge Functions to send emails
 * to users when their registration is approved or rejected.
 */

import { supabase } from '../config/supabaseClient';

/**
 * Send an approval email to a user
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendApprovalEmail(email, firstName, lastName) {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    
    const subject = '✅ Your CCS Alumni Account Has Been Approved!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to CCS Alumni Portal!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <p>Great news! Your registration for the <strong>UIC CCS Alumni Portal</strong> has been <strong style="color: #10b981;">approved</strong>!</p>
              
              <p>You can now:</p>
              <ul>
                <li>Connect with fellow alumni</li>
                <li>Browse job opportunities</li>
                <li>Stay updated with university news</li>
                <li>Participate in alumni events</li>
                <li>Access exclusive alumni resources</li>
              </ul>
              
              <center>
                <a href="https://ccsalumni.uic.edu.ph/login" class="button" style="color: white; text-decoration: none;">
                  Login to Your Account
                </a>
              </center>
              
              <p>If you have any questions, feel free to contact the alumni office.</p>
              
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
    `;

    // Call Supabase Edge Function to send email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to: email, subject, html }
    });

    if (error) {
      console.error('Error sending approval email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending approval email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a rejection email to a user
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} reason - Optional reason for rejection
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendRejectionEmail(email, firstName, lastName, reason = '') {
  try {
    console.log('📧 sendRejectionEmail called with:', { email, firstName, lastName, reason });
    const fullName = `${firstName} ${lastName}`.trim();
    
    const subject = 'Update on Your CCS Alumni Registration';
    console.log('📝 Subject:', subject);
    console.log('👤 Full name:', fullName);
    const html = `
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
              <p>Dear ${fullName},</p>
              
              <p>Thank you for your interest in joining the <strong>UIC CCS Alumni Portal</strong>.</p>
              
              <div class="alert">
                <p><strong>⚠️ Registration Status:</strong> Unfortunately, we were unable to approve your registration at this time.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
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
                <a href="https://ccsalumni.uic.edu.ph/register" class="button" style="color: white; text-decoration: none;">
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
    `;

    // Call Supabase Edge Function to send email
    console.log('🚀 Calling Supabase edge function send-email...');
    console.log('📬 To:', email);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to: email, subject, html }
    });

    console.log('📦 Edge function response - data:', data);
    console.log('📦 Edge function response - error:', error);

    if (error) {
      console.error('❌ Error sending rejection email:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message };
    }

    if (data && !data.success) {
      console.error('⚠️ Edge function returned unsuccessful response:', data);
      return { success: false, error: data.error || 'Unknown error from edge function' };
    }

    console.log('✅ Rejection email sent successfully!');
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending rejection email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a notification record in the database
 * @param {string} userId - User's ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createNotification(userId, type, title, message) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return { success: false, error: error.message };
  }
}
