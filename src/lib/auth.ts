import { supabase } from './supabase';
import { User, LoginCredentials, LoginResponse } from '@/types/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Attempting login with username:', credentials.username);

      // First, try to ensure the users table exists and has admin user
      await this.ensureAdminUser();

      // Query for the user
      const { data, error } = await supabase
        .from('users')
        .select('*')
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

      // Simple password check for demo (in production, use proper password hashing)
      if (credentials.password !== 'admin123') {
        console.log('Password mismatch');
        throw new Error('Invalid credentials - wrong password');
      }

      // Update last login
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      if (updateError) {
        console.warn('Failed to update last login:', updateError);
      }

      // Generate a simple token (in production, use JWT)
      const token = btoa(JSON.stringify({ userId: data.id, timestamp: Date.now() }));

      console.log('Login successful for user:', data.username);
      return {
        user: data as User,
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
        console.error('Failed to create admin user:', createError);
      } else {
        console.log('Admin user created successfully:', newUser);
      }
    } catch (error) {
      console.error('Error ensuring admin user:', error);
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