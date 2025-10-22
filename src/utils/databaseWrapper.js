/**
 * Database Operations Wrapper
 * Provides enhanced error handling and retry logic for database operations
 */

import supabase, { supabaseQuery, checkConnection, getConnectionState } from '../config/supabaseClient';
import { toast } from 'react-toastify';

// Enhanced database wrapper class
class DatabaseWrapper {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Execute a database operation with comprehensive error handling
   */
  async execute(operation, options = {}) {
    const { 
      errorMessage = 'Database operation failed',
      showToast = true,
      retryCount = this.retryAttempts,
      requiresAuth = false 
    } = options;

    try {
      // Check connection before operation
      const isConnected = await checkConnection();
      if (!isConnected) {
        const error = 'Database connection is not available';
        if (showToast) toast.error(error);
        throw new Error(error);
      }

      // Execute the operation with retry logic
      const result = await supabaseQuery(operation, errorMessage, retryCount);
      
      return {
        success: true,
        data: result.data,
        error: null,
        count: result.count
      };

    } catch (error) {
      const enhancedError = this.enhanceError(error, requiresAuth);
      
      if (showToast) {
        toast.error(enhancedError.userMessage);
      }

      console.error(`${errorMessage}:`, enhancedError);

      return {
        success: false,
        data: null,
        error: enhancedError,
        userMessage: enhancedError.userMessage
      };
    }
  }

  /**
   * Enhance error with user-friendly messages and context
   */
  enhanceError(error, requiresAuth = false) {
    const enhanced = {
      originalError: error,
      code: error.code || 'UNKNOWN',
      message: error.message || 'Unknown error',
      userMessage: 'An unexpected error occurred',
      category: 'general',
      retryable: true
    };

    // Categorize and enhance based on error codes and messages
    if (error.code) {
      switch (error.code) {
        case 'PGRST116':
          enhanced.category = 'data';
          enhanced.userMessage = 'No data found';
          enhanced.retryable = false;
          break;

        case '23505':
          enhanced.category = 'validation';
          enhanced.userMessage = 'This data already exists';
          enhanced.retryable = false;
          break;

        case '23503':
          enhanced.category = 'validation';
          enhanced.userMessage = 'Referenced data not found';
          enhanced.retryable = false;
          break;

        case '42501':
          enhanced.category = 'permission';
          enhanced.userMessage = requiresAuth 
            ? 'Please log in to access this feature'
            : 'You do not have permission to perform this action';
          enhanced.retryable = false;
          break;

        case '42P01':
          enhanced.category = 'schema';
          enhanced.userMessage = 'System configuration error. Please contact support.';
          enhanced.retryable = false;
          break;

        case 'PGRST301':
          enhanced.category = 'validation';
          enhanced.userMessage = 'Invalid data format. Please check your input.';
          enhanced.retryable = false;
          break;

        default:
          enhanced.category = 'network';
          enhanced.userMessage = 'Connection error. Please try again.';
      }
    }

    // Handle network-related errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      enhanced.category = 'network';
      enhanced.userMessage = 'Network connection error. Please check your internet connection.';
    }

    // Handle authentication errors
    if (error.message.includes('auth') || error.message.includes('session')) {
      enhanced.category = 'auth';
      enhanced.userMessage = 'Authentication required. Please log in again.';
      enhanced.retryable = false;
    }

    return enhanced;
  }

  /**
   * Common database operations with error handling
   */
  
  // Select operations
  async select(table, columns = '*', filters = {}, options = {}) {
    return this.execute(async () => {
      let query = supabase.from(table).select(columns, { count: 'exact' });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      return await query;
    }, { 
      errorMessage: `Failed to fetch data from ${table}`,
      ...options 
    });
  }

  // Insert operations
  async insert(table, data, options = {}) {
    return this.execute(async () => {
      return await supabase.from(table).insert(data).select();
    }, { 
      errorMessage: `Failed to insert data into ${table}`,
      ...options 
    });
  }

  // Update operations
  async update(table, data, filters, options = {}) {
    return this.execute(async () => {
      let query = supabase.from(table).update(data);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query.select();
    }, { 
      errorMessage: `Failed to update data in ${table}`,
      ...options 
    });
  }

  // Delete operations
  async delete(table, filters, options = {}) {
    return this.execute(async () => {
      let query = supabase.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query;
    }, { 
      errorMessage: `Failed to delete data from ${table}`,
      ...options 
    });
  }

  // Authentication operations
  async signUp(email, password, metadata = {}) {
    return this.execute(async () => {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
    }, { 
      errorMessage: 'Registration failed',
      requiresAuth: false 
    });
  }

  async signIn(email, password) {
    return this.execute(async () => {
      return await supabase.auth.signInWithPassword({
        email,
        password
      });
    }, { 
      errorMessage: 'Login failed',
      requiresAuth: false 
    });
  }

  async signOut() {
    return this.execute(async () => {
      return await supabase.auth.signOut();
    }, { 
      errorMessage: 'Logout failed',
      requiresAuth: false 
    });
  }

  // Storage operations
  async uploadFile(bucket, path, file, options = {}) {
    return this.execute(async () => {
      return await supabase.storage
        .from(bucket)
        .upload(path, file, options);
    }, { 
      errorMessage: 'File upload failed',
      requiresAuth: true 
    });
  }

  async downloadFile(bucket, path) {
    return this.execute(async () => {
      return await supabase.storage
        .from(bucket)
        .download(path);
    }, { 
      errorMessage: 'File download failed' 
    });
  }

  async deleteFile(bucket, path) {
    return this.execute(async () => {
      return await supabase.storage
        .from(bucket)
        .remove([path]);
    }, { 
      errorMessage: 'File deletion failed',
      requiresAuth: true 
    });
  }

  // System health check
  async healthCheck() {
    try {
      const connectionState = getConnectionState();
      const isConnected = await checkConnection();
      
      return {
        success: true,
        connected: isConnected,
        state: connectionState,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: this.enhanceError(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  // Bulk operations
  async bulkInsert(table, dataArray, options = {}) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return {
        success: false,
        error: { userMessage: 'No data provided for bulk insert' }
      };
    }

    return this.execute(async () => {
      return await supabase.from(table).insert(dataArray).select();
    }, { 
      errorMessage: `Failed to bulk insert data into ${table}`,
      ...options 
    });
  }

  // Transaction simulation (PostgreSQL doesn't support nested transactions in Supabase)
  async executeTransaction(operations) {
    const results = [];
    const errors = [];

    for (const operation of operations) {
      try {
        const result = await operation();
        results.push(result);
      } catch (error) {
        errors.push(this.enhanceError(error));
        // For now, we continue with other operations
        // In a real transaction, we would rollback
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      completed: results.length,
      failed: errors.length
    };
  }
}

// Create singleton instance
const db = new DatabaseWrapper();

// Export convenience methods
export const {
  execute,
  select,
  insert,
  update,
  delete: deleteRecord,
  signUp,
  signIn,
  signOut,
  uploadFile,
  downloadFile,
  deleteFile,
  healthCheck,
  bulkInsert,
  executeTransaction
} = db;

export default db;