import { createClient } from '@supabase/supabase-js';
import { API_ENDPOINTS } from './constants';

const SUPABASE_URL = API_ENDPOINTS.supabase.url;
const SUPABASE_ANON_KEY = API_ENDPOINTS.supabase.anonKey;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please check your .env file contains:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Connection state tracking
let connectionState = {
  isConnected: false,
  lastError: null,
  retryCount: 0,
  maxRetries: 3
};

// Create Supabase client with enhanced configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'uic-alumni-portal@1.0.0',
      'X-Client-Version': '1.0.0'
    }
  },
  db: {
    schema: 'public'
  }
});

// Enhanced error handling for Supabase operations
export const supabaseErrorHandler = (error) => {
  console.error('Supabase Error:', error);
  
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found for the requested query.';
      case 'PGRST301':
        return 'Invalid input data. Please check your submission.';
      case '23505':
        return 'This data already exists. Please check for duplicates.';
      case '23503':
        return 'Referenced data not found. Please check your input.';
      case '42P01':
        return 'Database table not found. Please contact support.';
      default:
        return error.message || 'Database error occurred.';
    }
  }
  
  return error.message || 'An unexpected database error occurred.';
};

// Connection health check
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows (but connection works)
      connectionState.isConnected = false;
      connectionState.lastError = error;
      return false;
    }
    
    connectionState.isConnected = true;
    connectionState.lastError = null;
    connectionState.retryCount = 0;
    return true;
  } catch (error) {
    connectionState.isConnected = false;
    connectionState.lastError = error;
    return false;
  }
};

// Get connection state
export const getConnectionState = () => ({ ...connectionState });

// Helper function for consistent API calls with retry logic
export const supabaseQuery = async (queryFn, errorMessage = 'Database operation failed', maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn();
      
      if (result.error) {
        // Don't retry certain errors
        if (result.error.code === 'PGRST116' || // No rows found
            result.error.code === '23505' ||    // Unique constraint
            result.error.code === '23503' ||    // Foreign key constraint
            result.error.code === '42501') {    // Insufficient privileges
          throw new Error(supabaseErrorHandler(result.error));
        }
        
        lastError = result.error;
        if (attempt < maxRetries) {
          console.warn(`Query attempt ${attempt + 1} failed, retrying...`, result.error.message);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
          continue;
        }
        throw new Error(supabaseErrorHandler(result.error));
      }
      
      // Success - update connection state
      connectionState.isConnected = true;
      connectionState.lastError = null;
      connectionState.retryCount = 0;
      
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.warn(`Query attempt ${attempt + 1} failed, retrying...`, error.message);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }
  
  // All attempts failed
  connectionState.isConnected = false;
  connectionState.lastError = lastError;
  connectionState.retryCount = maxRetries;
  
  console.error(errorMessage, lastError);
  throw new Error(lastError?.message || errorMessage);
};

// Simplified query helper for common operations
export const simpleQuery = {
  // Get data with error handling
  select: async (table, columns = '*', filters = {}) => {
    return supabaseQuery(async () => {
      let query = supabase.from(table).select(columns);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      return await query;
    }, `Failed to fetch data from ${table}`);
  },
  
  // Insert data
  insert: async (table, data) => {
    return supabaseQuery(async () => {
      return await supabase.from(table).insert(data).select();
    }, `Failed to insert data into ${table}`);
  },
  
  // Update data
  update: async (table, data, filters) => {
    return supabaseQuery(async () => {
      let query = supabase.from(table).update(data);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query.select();
    }, `Failed to update data in ${table}`);
  },
  
  // Delete data
  delete: async (table, filters) => {
    return supabaseQuery(async () => {
      let query = supabase.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query;
    }, `Failed to delete data from ${table}`);
  }
};

// Initialize connection check on module load
checkConnection().then(connected => {
  if (connected) {
    console.log('✅ Supabase connection established successfully');
  } else {
    console.warn('⚠️ Supabase connection issues detected');
  }
}).catch(error => {
  console.error('❌ Failed to establish Supabase connection:', error.message);
});

// Export default client
export default supabase;

