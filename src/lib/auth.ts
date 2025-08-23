import { User, LoginCredentials, LoginResponse } from '@/types/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Attempting login for username:', credentials.username);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Login failed' }));
        console.log('Login failed:', error);
        throw new Error(error || 'Login failed');
      }

      const { user } = await res.json();
      console.log('Login successful for user:', user.username, 'Role:', user.role);
      
      // Store basic session client-side if desired; cookie is already set by the API
      this.saveSession('cookie', user);
      return { user, token: 'cookie' };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      // Clear session cookie by calling logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_data');
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      if (typeof window === 'undefined') return null;

      // Verify session with the server
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (!res.ok) {
        // Session is invalid, clear local storage
        this.logout();
        return null;
      }

      const { user } = await res.json();
      return user;
    } catch (error) {
      console.error('Error verifying session:', error);
      this.logout();
      return null;
    }
  }



  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  static async checkPermission(userId: string, tableName: string, permission: 'read' | 'write' | 'delete'): Promise<boolean> {
    try {
      // For now, return true for admin users, false for others
      // This can be enhanced later with proper permission checking
      const user = await this.getCurrentUser();
      if (!user) return false;
      
      // Admin users have all permissions
      if (user.role === 'admin') return true;
      
      // For now, return false for non-admin users
      // TODO: Implement proper permission checking with user_permissions table
      return false;
    } catch (error) {
      return false;
    }
  }

  static saveSession(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('user_data', JSON.stringify(user));
    }
  }
} 