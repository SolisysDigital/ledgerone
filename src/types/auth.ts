export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  table_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  granted_by: string;
  granted_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
} 