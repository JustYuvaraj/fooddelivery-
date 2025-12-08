import apiClient from '@/utils/api';
import { AuthResponse, User } from '@/types/api.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_AGENT';
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async validateToken(): Promise<User> {
    const response = await apiClient.get<User>('/auth/validate');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default new AuthService();



