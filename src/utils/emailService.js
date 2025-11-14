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

/**
 * Send an event invitation email to an alumni
 * @param {string} email - Alumni's email address
 * @param {string} firstName - Alumni's first name
 * @param {string} lastName - Alumni's last name
 * @param {string} eventTitle - Event title
 * @param {string} eventDate - Event start date
 * @param {string} eventLocation - Event location
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendEventInvitationEmail(email, firstName, lastName, eventTitle, eventDate, eventLocation) {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    const subject = `🎉 You're Invited: ${eventTitle}`;
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
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .event-details h3 { margin-top: 0; color: #667eea; }
            .detail-item { margin: 10px 0; display: flex; align-items: start; }
            .detail-label { font-weight: bold; min-width: 80px; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <p>We're excited to invite you to join us for an upcoming professional development event!</p>
              
              <div class="event-details">
                <h3>📅 Event Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Event:</span>
                  <span><strong>${eventTitle}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span>${formattedDate}</span>
                </div>
                ${eventLocation ? `
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span>${eventLocation}</span>
                </div>
                ` : ''}
              </div>
              
              <p>This event has been specially curated for our CCS alumni community. We hope you can join us!</p>
              
              <center>
                <a href="https://ccsalumni.uic.edu.ph/professional-development" class="button" style="color: white; text-decoration: none;">
                  View Event Details
                </a>
              </center>
              
              <p>You can view more details about the event and manage your registration by logging into your alumni portal.</p>
              
              <p>We look forward to seeing you there!</p>
              
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
      console.error('Error sending event invitation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending event invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a speaker invitation email to an alumni
 * @param {string} email - Alumni's email address
 * @param {string} firstName - Alumni's first name
 * @param {string} lastName - Alumni's last name
 * @param {string} eventTitle - Event title
 * @param {string} eventDate - Event start date
 * @param {string} eventLocation - Event location
 * @param {string} role - Speaker role (speaker, keynote_speaker, panelist, moderator)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendSpeakerInvitationEmail(email, firstName, lastName, eventTitle, eventDate, eventLocation, role) {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    const roleDisplay = role === 'keynote_speaker' ? 'Keynote Speaker' : 
                       role === 'panelist' ? 'Panelist' :
                       role === 'moderator' ? 'Moderator' : 'Speaker';
    
    const subject = `🎬 Speaker Invitation: ${eventTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .event-details h3 { margin-top: 0; color: #f59e0b; }
            .detail-item { margin: 10px 0; display: flex; align-items: start; }
            .detail-label { font-weight: bold; min-width: 80px; color: #666; }
            .highlight-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 Speaker Invitation</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <p>We are honored to invite you to be a <strong>${roleDisplay}</strong> at our upcoming professional development event!</p>
              
              <div class="highlight-box">
                <p style="margin: 0; font-size: 1.1em; text-align: center;">
                  <strong>🎖️ You've been invited as ${roleDisplay}</strong>
                </p>
              </div>
              
              <div class="event-details">
                <h3>📅 Event Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Event:</span>
                  <span><strong>${eventTitle}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Role:</span>
                  <span><strong>${roleDisplay}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span>${formattedDate}</span>
                </div>
                ${eventLocation ? `
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span>${eventLocation}</span>
                </div>
                ` : ''}
              </div>
              
              <p>Your expertise and experience would be invaluable to our CCS alumni community. We believe your insights will greatly benefit the attendees.</p>
              
              <center>
                <a href="https://ccsalumni.uic.edu.ph/professional-development" class="button" style="color: white; text-decoration: none;">
                  View Event & Respond
                </a>
              </center>
              
              <p>Please log into your alumni portal to accept or decline this invitation and view more details about the event.</p>
              
              <p>We look forward to your positive response!</p>
              
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
      console.error('Error sending speaker invitation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending speaker invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send speaker application approval email
 * @param {string} email - Applicant's email address
 * @param {string} firstName - Applicant's first name
 * @param {string} lastName - Applicant's last name
 * @param {string} eventTitle - Event title
 * @param {string} eventDate - Event start date
 * @param {string} eventLocation - Event location
 * @param {string} role - Speaker role (speaker, keynote_speaker, panelist, moderator)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendSpeakerApplicationApprovalEmail(email, firstName, lastName, eventTitle, eventDate, eventLocation, role) {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    const roleDisplay = role === 'keynote_speaker' ? 'Keynote Speaker' : 
                       role === 'panelist' ? 'Panelist' :
                       role === 'moderator' ? 'Moderator' : 'Speaker';
    
    const subject = `✅ Your Speaker Application Has Been Approved - ${eventTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .event-details h3 { margin-top: 0; color: #10b981; }
            .detail-item { margin: 10px 0; display: flex; align-items: start; }
            .detail-label { font-weight: bold; min-width: 80px; color: #666; }
            .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <div class="success-box">
                <p style="margin: 0; font-size: 1.2em;">
                  <strong>✅ Your speaker application has been APPROVED!</strong>
                </p>
              </div>
              
              <p>We're thrilled to inform you that your application to be a <strong>${roleDisplay}</strong> has been approved!</p>
              
              <div class="event-details">
                <h3>📅 Event Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Event:</span>
                  <span><strong>${eventTitle}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Your Role:</span>
                  <span><strong>${roleDisplay}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span>${formattedDate}</span>
                </div>
                ${eventLocation ? `
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span>${eventLocation}</span>
                </div>
                ` : ''}
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Log into your alumni portal to view complete event details</li>
                <li>Prepare your presentation or session materials</li>
                <li>We'll be in touch with additional details and requirements</li>
              </ul>
              
              <center>
                <a href="https://ccsalumni.uic.edu.ph/professional-development" class="button" style="color: white; text-decoration: none;">
                  View Event Details
                </a>
              </center>
              
              <p>Thank you for contributing your expertise to our CCS alumni community. We're looking forward to your participation!</p>
              
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
      console.error('Error sending speaker application approval email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending speaker application approval email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send speaker application rejection email
 * @param {string} email - Applicant's email address
 * @param {string} firstName - Applicant's first name
 * @param {string} lastName - Applicant's last name
 * @param {string} eventTitle - Event title
 * @param {string} role - Speaker role (speaker, keynote_speaker, panelist, moderator)
 * @param {string} reviewNotes - Optional feedback/reason for rejection
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendSpeakerApplicationRejectionEmail(email, firstName, lastName, eventTitle, role, reviewNotes = '') {
  try {
    const fullName = `${firstName} ${lastName}`.trim();
    
    const roleDisplay = role === 'keynote_speaker' ? 'Keynote Speaker' : 
                       role === 'panelist' ? 'Panelist' :
                       role === 'moderator' ? 'Moderator' : 'Speaker';
    
    const subject = `Update on Your Speaker Application - ${eventTitle}`;
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
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .event-details h3 { margin-top: 0; color: #667eea; }
            .detail-item { margin: 10px 0; display: flex; align-items: start; }
            .detail-label { font-weight: bold; min-width: 80px; color: #666; }
            .info-box { background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Speaker Application Update</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>
              
              <p>Thank you for your interest in being a <strong>${roleDisplay}</strong> for "<strong>${eventTitle}</strong>".</p>
              
              <div class="info-box">
                <p style="margin: 0;">After careful consideration, we regret to inform you that we are unable to accept your speaker application at this time.</p>
              </div>
              
              ${reviewNotes ? `
              <div class="event-details">
                <h3>Feedback</h3>
                <p>${reviewNotes}</p>
              </div>
              ` : ''}
              
              <p>This decision was not easy to make, as we received many excellent applications. Please note that this does not reflect on your qualifications or expertise.</p>
              
              <p><strong>We encourage you to:</strong></p>
              <ul>
                <li>Apply for future speaking opportunities</li>
                <li>Participate as an attendee in this and other events</li>
                <li>Stay connected with the CCS alumni community</li>
              </ul>
              
              <center>
                <a href="https://ccsalumni.uic.edu.ph/professional-development" class="button" style="color: white; text-decoration: none;">
                  View Other Events
                </a>
              </center>
              
              <p>We value your continued engagement with the CCS alumni community and hope to see you at our events.</p>
              
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
      console.error('Error sending speaker application rejection email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error sending speaker application rejection email:', error);
    return { success: false, error: error.message };
  }
}
