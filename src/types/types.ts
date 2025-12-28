export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

// API响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    role: string;
    createdAt: number;
    lastLoginAt?: number;
  };
  token?: string;
}
