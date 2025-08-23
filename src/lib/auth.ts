import { User, LoginCredentials, LoginResponse } from '@/types/auth';

// Enable verbose logging for debugging - can be disabled by setting VERBOSE_LOGIN=false
const VERBOSE_LOGIN = typeof window !== 'undefined' ? 
  (localStorage.getItem('VERBOSE_LOGIN') !== 'false') : 
  (process.env.VERBOSE_LOGIN !== 'false');

function log(message: string, data?: any) {
  if (VERBOSE_LOGIN) {
    console.log(`[AUTH CLIENT DEBUG] ${message}`, data ? data : '');
  }
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      log('=== CLIENT LOGIN START ===');
      log('Attempting login for username:', credentials.username);
      log('Login credentials:', { username: credentials.username, hasPassword: !!credentials.password });
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      log('Login API response received:', { 
        status: res.status, 
        statusText: res.statusText, 
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
        log('Login API error response:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }

      const responseData = await res.json();
      log('Login API success response:', responseData);
      
      const { user } = responseData;
      log('Login successful for user:', { username: user.username, role: user.role, id: user.id });
      
      // Store basic session client-side if desired; cookie is already set by the API
      this.saveSession('cookie', user);
      log('Session saved client-side');
      
      log('=== CLIENT LOGIN SUCCESS ===');
      return { user, token: 'cookie' };
    } catch (error) {
      log('=== CLIENT LOGIN FAILED ===');
      log('Login error caught:', error);
      log('Error type:', typeof error);
      log('Error message:', error instanceof Error ? error.message : 'Unknown error type');
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      log('=== CLIENT LOGOUT START ===');
      
      // Clear session cookie by calling logout API
      log('Calling logout API');
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      log('Logout API response:', { status: res.status, ok: res.ok });
      
    } catch (error) {
      log('Error during logout API call:', error);
    } finally {
      // Clear session storage
      if (typeof window !== 'undefined') {
        log('Clearing client-side session storage');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_data');
        log('Client-side session storage cleared');
      }
      log('=== CLIENT LOGOUT COMPLETE ===');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      if (typeof window === 'undefined') {
        log('getCurrentUser called on server-side, returning null');
        return null;
      }

      log('=== CLIENT SESSION VERIFICATION START ===');
      log('Verifying session with server');

      // Verify session with the server
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      log('Verify API response:', { 
        status: res.status, 
        statusText: res.statusText, 
        ok: res.ok 
      });

      if (!res.ok) {
        log('Session verification failed, clearing session');
        // Session is invalid, clear local storage
        this.logout();
        return null;
      }

      const responseData = await res.json();
      log('Session verification successful:', responseData);
      
      const { user } = responseData;
      log('=== CLIENT SESSION VERIFICATION SUCCESS ===');
      return user;
    } catch (error) {
      log('=== CLIENT SESSION VERIFICATION FAILED ===');
      log('Error verifying session:', error);
      log('Error type:', typeof error);
      log('Error message:', error instanceof Error ? error.message : 'Unknown error type');
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