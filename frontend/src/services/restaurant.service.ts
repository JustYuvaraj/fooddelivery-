import apiClient from '@/utils/api';
import { Restaurant, Product } from '@/types/api.types';

class RestaurantService {
  async getAllRestaurants(page = 0, size = 20) {
    const response = await apiClient.get('/restaurants', {
      params: { page, size, sort: 'rating,desc' },
    });
    return response.data;
  }

  async getRestaurantById(id: number): Promise<Restaurant> {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data;
  }

  async searchRestaurants(name: string, page = 0, size = 20) {
    const response = await apiClient.get('/restaurants/search', {
      params: { name, page, size },
    });
    return response.data;
  }

  async searchByCuisine(type: string, page = 0, size = 20) {
    const response = await apiClient.get('/restaurants/cuisine', {
      params: { type, page, size },
    });
    return response.data;
  }

  async getNearbyRestaurants(lat: number, lng: number, radius = 5.0): Promise<Restaurant[]> {
    const response = await apiClient.get('/restaurants/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  }

  async getTopRatedRestaurants(limit = 10): Promise<Restaurant[]> {
    const response = await apiClient.get('/restaurants/top-rated', {
      params: { limit },
    });
    return response.data;
  }

  async getRestaurantMenu(restaurantId: number): Promise<Product[]> {
    const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
  }

  async getMenuByCategory(restaurantId: number, category: string): Promise<Product[]> {
    const response = await apiClient.get(`/restaurants/${restaurantId}/menu/category`, {
      params: { category },
    });
    return response.data;
  }
}

export default new RestaurantService();



