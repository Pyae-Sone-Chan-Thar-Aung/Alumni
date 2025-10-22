# FIX RECIPIENT SELECTION ISSUE

## Problem
When trying to compose a message, the "To:" dropdown only shows "Select recipient" with no actual recipients available.

## Root Cause
The messaging system only allows you to send messages to users you have an **accepted connection** with. Currently, there are no accepted connections in your database, which is why no recipients appear in the dropdown.

## Solution
You need to create some user connections first. Here are two ways to fix this:

### Option 1: Run the SQL Script (Recommended)

1. **Go to Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in and select your CCS Alumni Portal project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute the Script**
   - Copy the contents of `create-sample-connections.sql`
   - Paste it into the SQL Editor
   - Click "Run"

4. **Verify Success**
   - You should see output showing connections were created
   - The script will display sample connections that were created

### Option 2: Manual Process Through the App

1. **Go to Batchmates Page**
   - Navigate to the "Batchmates" section in your app
   - Look for other alumni users

2. **Send Connection Requests**
   - Find other users and send them connection requests
   - Wait for them to accept your requests

3. **Accept Incoming Requests**
   - Check the "Connections" tab in Messages
   - Accept any pending connection requests

## What the SQL Script Does

The `create-sample-connections.sql` script:

1. **Creates bidirectional connections** between all approved users
2. **Sets status to 'accepted'** so you can immediately send messages
3. **Adds sample messages** to test the system
4. **Verifies the connections** were created properly

## Expected Results

After running the script, you should see:
- Multiple accepted connections between users
- Recipients available in the "To:" dropdown when composing messages
- Sample messages in the inbox

## Testing the Fix

1. **Go to Messages Page**
   - Navigate to the Messages section

2. **Click Compose**
   - Click the "Compose" button

3. **Select Recipient**
   - The "To:" dropdown should now show available recipients
   - Select a recipient from the list

4. **Send Test Message**
   - Enter a subject and message
   - Click "Send Message"

5. **Verify Delivery**
   - Check the recipient's inbox
   - Confirm the message was delivered

## Troubleshooting

### If the dropdown is still empty:
1. **Check user approval status** - Only approved users can be recipients
2. **Verify connections exist** - Run a query to check if connections were created
3. **Check RLS policies** - Ensure Row Level Security allows viewing connections

### If you get permission errors:
1. **Run as admin** - Make sure you're logged in as an admin user
2. **Check RLS policies** - The script should bypass RLS, but verify policies are correct

### If connections exist but no recipients show:
1. **Check the frontend code** - The query might be filtering incorrectly
2. **Verify user authentication** - Make sure you're logged in as a valid user
3. **Check browser console** - Look for JavaScript errors

## Additional Features

Once connections are working, you can also test:
- **Connection requests** - Send and accept connection requests
- **Notifications** - Receive notifications for new messages
- **Message status** - Mark messages as read/unread
- **Search functionality** - Search through messages and connections

## Long-term Solution

For production use, consider:
1. **User discovery** - Add features to help users find and connect with each other
2. **Batchmate suggestions** - Suggest connections based on graduation year, course, etc.
3. **Connection management** - Allow users to manage their connections
4. **Privacy controls** - Let users control who can send them messages

The messaging system is now ready for testing and use!
