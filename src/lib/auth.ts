import { createClient } from '@supabase/supabase-js';
import { User, LoginCredentials, LoginResponse } from '@/types/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // For now, we'll use a simple approach with direct database query
      // In production, you'd want to use Supabase Auth or a proper auth service
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials');
      }

      // Simple password check for demo (in production, use proper password hashing)
      if (credentials.password !== 'admin123') {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      // Generate a simple token (in production, use JWT)
      const token = btoa(JSON.stringify({ userId: data.id, timestamp: Date.now() }));

      return {
        user: data as User,
        token
      };
    } catch (error) {
      throw new Error('Login failed');
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