import apiClient from '@/utils/api';
import { Order, OrderStatus } from '@/types/api.types';

export interface CreateOrderRequest {
  restaurantId: number;
  deliveryAddressId: number;
  items: Array<{
    productId: number;
    quantity: number;
    specialRequests?: string;
  }>;
  specialInstructions?: string;
}

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post('/orders', data);
    return response.data;
  }

  async getCustomerOrders(page = 0, size = 10) {
    const response = await apiClient.get('/orders/customer/my-orders', {
      params: { page, size, sort: 'placedAt,desc' },
    });
    return response.data;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId: number, reason: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  }

  async getFilteredOrders(status?: OrderStatus, fromDate?: string, toDate?: string, page = 0, size = 10) {
    const response = await apiClient.get('/orders/customer/filtered', {
      params: { status, fromDate, toDate, page, size },
    });
    return response.data;
  }

  async reorder(orderId: number, addressId?: number): Promise<Order> {
    const response = await apiClient.post(`/orders/${orderId}/reorder`, null, {
      params: { addressId },
    });
    return response.data;
  }

  async getRestaurantOrders(status?: OrderStatus, page = 0, size = 10) {
    const response = await apiClient.get('/orders/restaurant/my-orders', {
      params: { status, page, size, sort: 'placedAt,desc' },
    });
    return response.data;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const response = await apiClient.patch(`/orders/${orderId}/status`, null, {
      params: { status },
    });
    return response.data;
  }
}

export default new OrderService();



