# FIX REGISTRATION SYSTEM - "Failed to save registration data" Error

## Problem Identified
The registration system was failing with "Failed to save registration data. Please try again." because:

1. **Schema Mismatch**: The `pending_registrations` table schema didn't match what the registration form was trying to insert
2. **Column Name Conflicts**: Different database schema files had conflicting column names (`course` vs `program`, `batch_year` as TEXT vs INTEGER)
3. **Missing Error Details**: The error handling wasn't providing specific information about what was failing
4. **Data Type Mismatches**: The form was trying to insert integers but the table expected text

## Root Cause Analysis

### Registration Code Was Trying to Insert:
```javascript
{
  email: formData.email,
  first_name: formData.firstName,
  last_name: formData.lastName,
  phone: formData.phone,
  course: formData.course,                    // ❌ Some schemas had 'program'
  batch_year: parseInt(formData.batch),       // ❌ Some schemas had TEXT
  graduation_year: parseInt(formData.graduationYear), // ❌ Some schemas had TEXT
  current_job: formData.currentJob,
  company: formData.company,
  address: formData.address,
  city: formData.city,
  country: formData.country,
  student_id: formData.studentId,
  status: 'pending',
  submitted_at: new Date().toISOString()      // ❌ Some schemas didn't have this
}
```

### But Database Schema Had:
- `program` instead of `course`
- `batch_year` as TEXT instead of INTEGER
- `graduation_year` as TEXT instead of INTEGER
- Missing `submitted_at` column in some schemas

## Solution Applied

### 1. **Fixed Database Schema** (`fix_registration_system.sql`)
Created a new `pending_registrations` table with the correct schema that matches the registration form:

```sql
CREATE TABLE public.pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    
    -- Academic Information
    student_id TEXT,
    course TEXT NOT NULL,              -- ✅ Matches form field name
    batch_year INTEGER,                -- ✅ Matches form data type
    graduation_year INTEGER NOT NULL,  -- ✅ Matches form data type
    
    -- Professional Information
    current_job TEXT,
    company TEXT,
    
    -- Contact Information
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    
    -- Profile Image
    profile_image_url TEXT,
    
    -- Status and Processing
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Enhanced Registration Component** (`src/pages/Register.js`)
Improved error handling and data validation:

#### Better Error Handling:
```javascript
if (regError) {
  console.error('Registration data error:', regError);
  console.error('Error details:', {
    message: regError.message,
    code: regError.code,
    details: regError.details,
    hint: regError.hint
  });
  
  // Provide more specific error messages
  if (regError.message.includes('duplicate key')) {
    toast.error('An account with this email already exists. Please use a different email or try logging in.');
  } else if (regError.message.includes('violates check constraint')) {
    toast.error('Invalid data provided. Please check all required fields are filled correctly.');
  } else if (regError.message.includes('violates not-null constraint')) {
    toast.error('Please fill in all required fields (marked with *)');
  } else {
    toast.error(`Registration failed: ${regError.message}`);
  }
  return;
}
```

#### Better Data Validation:
```javascript
const registrationData = {
  email: formData.email,
  first_name: formData.firstName,
  last_name: formData.lastName,
  phone: formData.phone || null,                    // ✅ Handle empty strings
  course: formData.course,
  batch_year: formData.batch ? parseInt(formData.batch) : null,  // ✅ Safe parsing
  graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,  // ✅ Safe parsing
  current_job: formData.currentJob || null,
  company: formData.company || null,
  address: formData.address || null,
  city: formData.city || null,
  country: formData.country || 'Philippines',
  student_id: formData.studentId || null,
  status: 'pending'
};
```

#### Cleanup on Auth Failure:
```javascript
if (authError) {
  // If auth fails, we should clean up the pending registration
  if (regData && regData[0]) {
    await supabase
      .from('pending_registrations')
      .delete()
      .eq('id', regData[0].id);
  }
  
  toast.error(authError.message || 'Failed to create user account. Please try again.');
  return;
}
```

### 3. **Added Row Level Security (RLS) Policies**
Proper security policies for the `pending_registrations` table:

- **Public Insert**: Anyone can create pending registrations (for new user registration)
- **User View**: Users can view their own pending registration
- **Admin Access**: Admins can view, update, and delete all pending registrations

## How to Apply the Fix

### Step 1: Run the Database Fix
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `fix_registration_system.sql`
3. Click **Run** to execute the script
4. This will:
   - Drop the old `pending_registrations` table
   - Create a new table with the correct schema
   - Set up proper indexes and RLS policies
   - Force Supabase to reload the schema cache

### Step 2: Verify the Fix
1. Try registering a new user account
2. Check the browser console for detailed logging
3. The registration should now work without the "Failed to save registration data" error

### Step 3: Test Different Scenarios
1. **Valid Registration**: Should work without errors
2. **Duplicate Email**: Should show "An account with this email already exists"
3. **Missing Required Fields**: Should show "Please fill in all required fields"
4. **Invalid Data**: Should show specific validation errors

## Expected Results After Fix

### ✅ **Registration Should Work**
- New users can register successfully
- Data is saved to `pending_registrations` table
- Supabase auth user is created
- User receives confirmation email

### ✅ **Better Error Messages**
- Specific error messages for different failure scenarios
- Detailed console logging for debugging
- User-friendly error notifications

### ✅ **Data Integrity**
- Proper data types (INTEGER for years, TEXT for strings)
- Required field validation
- Unique email constraint
- Proper foreign key relationships

### ✅ **Security**
- Row Level Security policies in place
- Public can only insert pending registrations
- Users can only view their own data
- Admins have full access

## Troubleshooting

### If Registration Still Fails:
1. **Check Browser Console**: Look for detailed error messages
2. **Check Supabase Logs**: Go to Supabase Dashboard → Logs
3. **Verify Table Schema**: Run the verification query in the SQL script
4. **Check RLS Policies**: Ensure policies are correctly set up

### Common Issues:
- **"Table doesn't exist"**: Run the SQL script again
- **"Permission denied"**: Check RLS policies
- **"Invalid data type"**: Verify form data parsing
- **"Duplicate key"**: User already exists, try different email

The registration system should now work properly without the "Failed to save registration data" error!
