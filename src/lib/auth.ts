import { supabase } from './supabase';
import { User, LoginCredentials, LoginResponse } from '@/types/auth';
import CryptoJS from 'crypto-js';

export class AuthService {
  // Track if we've already tried to ensure admin user
  private static adminUserEnsured = false;

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Attempting login with username:', credentials.username);

      // Only ensure admin user once per session
      if (!this.adminUserEnsured) {
        await this.ensureAdminUser();
        this.adminUserEnsured = true;
      }

      // Query for the user - we need the password_hash field for verification
      const { data, error } = await supabase
        .from('users')
        .select('id, username, password_hash, full_name, role, status')
        .eq('username', credentials.username)
        .eq('status', 'active')
        .single();

      console.log('Database query result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.log('No user found with username:', credentials.username);
        throw new Error('Invalid credentials - user not found');
      }

      // Check password against the stored hash in our custom users table
      if (!data.password_hash) {
        console.log('User has no password_hash field');
        console.log('Available fields:', Object.keys(data));
        throw new Error('Invalid credentials - user account not properly configured');
      }

      // Try to verify the password using different methods
      // First, try direct comparison (in case it's stored as plain text)
      if (data.password_hash === credentials.password) {
        console.log('Password verified by direct comparison');
      } else {
        // Try SHA-256 hash comparison
        const sha256Hash = CryptoJS.SHA256(credentials.password).toString();
        if (data.password_hash === sha256Hash) {
          console.log('Password verified by SHA-256 hash');
        } else {
          // Try MD5 hash comparison (less secure, but common)
          const md5Hash = CryptoJS.MD5(credentials.password).toString();
          if (data.password_hash === md5Hash) {
            console.log('Password verified by MD5 hash');
          } else {
            console.log('Password verification failed - no matching hash method found');
            console.log('Stored hash:', data.password_hash);
            console.log('Entered password length:', credentials.password.length);
            throw new Error('Invalid credentials - wrong password');
          }
        }
      }

      // Generate a simple token (in production, use JWT)
      const token = btoa(JSON.stringify({ userId: data.id, timestamp: Date.now() }));

      // Use the user data from our custom table
      const userProfile = {
        id: data.id,
        username: data.username,
        full_name: data.full_name || 'System Administrator',
        role: data.role || 'admin',
        status: data.status || 'active'
      };

      console.log('Login successful for user:', userProfile.username);
      return {
        user: userProfile as User,
        token
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  static async ensureAdminUser(): Promise<void> {
    try {
      // Check if admin user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'admin')
        .single();

      if (existingUser) {
        console.log('Admin user already exists');
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking for admin user:', checkError);
        return;
      }

      // Create admin user if it doesn't exist
      console.log('Creating admin user...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          username: 'admin',
          password_hash: '$2a$10$rQZ9vKzqX8mN3pL2sJ1hA.BCDEFGHIJKLMNOPQRSTUVWXYZabcdef',
          full_name: 'System Administrator',
          role: 'admin',
          status: 'active'
        }])
        .select()
        .single();

      if (createError) {
        // Check if it's a duplicate key error
        if (createError.code === '23505') { // PostgreSQL unique constraint violation
          console.log('Admin user already exists (caught duplicate key error)');
          return;
        }
        console.error('Failed to create admin user:', createError);
      } else {
        console.log('Admin user created successfully:', newUser);
      }
    } catch (error) {
      // Handle any other errors gracefully
      console.error('Error ensuring admin user:', error);
      // Don't throw - just log the error and continue
    }
  }

  static async logout(): Promise<void> {
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      if (typeof window === 'undefined') return null;

      const token = sessionStorage.getItem('auth_token');
      const userData = sessionStorage.getItem('user_data');

      if (!token || !userData) return null;

      // Verify token and return user data
      const user = JSON.parse(userData) as User;
      return user;
    } catch (error) {
      return null;
    }
  }

  static async checkPermission(userId: string, tableName: string, permission: 'read' | 'write' | 'delete'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('table_name', tableName)
        .single();

      if (error || !data) return false;

      switch (permission) {
        case 'read':
          return data.can_read;
        case 'write':
          return data.can_write;
        case 'delete':
          return data.can_delete;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('auth_token');
  }

  static saveSession(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('user_data', JSON.stringify(user));
    }
  }
} 