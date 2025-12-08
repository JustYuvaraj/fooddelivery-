import apiClient from '@/utils/api';
import { Address, ProfileDTO, ReviewDTO } from '@/types/api.types';

export interface CreateAddressRequest {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

class CustomerService {
  // Address Management
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/customer/addresses');
    return response.data;
  }

  async getAddressById(addressId: number): Promise<Address> {
    const response = await apiClient.get(`/customer/addresses/${addressId}`);
    return response.data;
  }

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await apiClient.post('/customer/addresses', data);
    return response.data;
  }

  async updateAddress(addressId: number, data: UpdateAddressRequest): Promise<Address> {
    const response = await apiClient.put(`/customer/addresses/${addressId}`, data);
    return response.data;
  }

  async deleteAddress(addressId: number): Promise<void> {
    await apiClient.delete(`/customer/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId: number): Promise<Address> {
    const response = await apiClient.put(`/customer/addresses/${addressId}/default`);
    return response.data;
  }

  // Profile Management
  async getProfile(): Promise<ProfileDTO> {
    const response = await apiClient.get('/customer/profile');
    return response.data;
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; profileImageUrl?: string }): Promise<ProfileDTO> {
    const response = await apiClient.put('/customer/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/customer/password', { currentPassword, newPassword });
  }

  // Favorite Restaurants
  async getFavorites() {
    const response = await apiClient.get('/customer/favorites');
    return response.data;
  }

  async addFavorite(restaurantId: number): Promise<void> {
    await apiClient.post(`/customer/favorites/${restaurantId}`);
  }

  async removeFavorite(restaurantId: number): Promise<void> {
    await apiClient.delete(`/customer/favorites/${restaurantId}`);
  }

  async isFavorite(restaurantId: number): Promise<boolean> {
    const response = await apiClient.get(`/customer/favorites/${restaurantId}/check`);
    return response.data;
  }

  // Reviews
  async createReview(data: { orderId: number; foodRating: number; deliveryRating?: number; comment?: string }): Promise<ReviewDTO> {
    const response = await apiClient.post('/customer/reviews', data);
    return response.data;
  }

  async getReviews(page = 0, size = 10) {
    const response = await apiClient.get('/customer/reviews', {
      params: { page, size },
    });
    return response.data;
  }
}

export default new CustomerService();



