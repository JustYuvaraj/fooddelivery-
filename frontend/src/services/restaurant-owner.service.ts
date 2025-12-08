import apiClient from '@/utils/api';
import { Restaurant, Product } from '@/types/api.types';

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable?: boolean;
  prepTimeMinutes?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  prepTimeMinutes?: number;
}

export interface UpdateRestaurantRequest {
  name?: string;
  description?: string;
  cuisineType?: string;
  phone?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  minOrderAmount?: number;
  deliveryRadiusKm?: number;
  logoUrl?: string;
  bannerUrl?: string;
}

class RestaurantOwnerService {
  // Profile Management
  async getProfile(): Promise<Restaurant> {
    const response = await apiClient.get('/restaurant/profile');
    return response.data;
  }

  async updateProfile(data: UpdateRestaurantRequest): Promise<Restaurant> {
    const response = await apiClient.put('/restaurant/profile', data);
    return response.data;
  }

  async updateStatus(accepting: boolean): Promise<Restaurant> {
    const response = await apiClient.put('/restaurant/status', null, {
      params: { accepting },
    });
    return response.data;
  }

  // Menu Management
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/restaurant/products');
    return response.data;
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post('/restaurant/products', data);
    return response.data;
  }

  async updateProduct(productId: number, data: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put(`/restaurant/products/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: number): Promise<void> {
    await apiClient.delete(`/restaurant/products/${productId}`);
  }

  async toggleProductAvailability(productId: number, available: boolean): Promise<Product> {
    const response = await apiClient.put(`/restaurant/products/${productId}/availability`, null, {
      params: { available },
    });
    return response.data;
  }

  // Analytics
  async getStatistics() {
    const response = await apiClient.get('/restaurant/analytics/statistics');
    return response.data;
  }

  async getSalesReport(startDate: string, endDate: string) {
    const response = await apiClient.get('/restaurant/analytics/sales', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getTopSellingItems(startDate: string, endDate: string, limit = 10) {
    const response = await apiClient.get('/restaurant/analytics/top-items', {
      params: { startDate, endDate, limit },
    });
    return response.data;
  }
}

export default new RestaurantOwnerService();



