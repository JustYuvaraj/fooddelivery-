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
    const response = await apiClient.post('/customer/orders', data);
    return response.data;
  }

  async getCustomerOrders(page = 0, size = 10) {
    const response = await apiClient.get('/customer/orders', {
      params: { page, size, sort: 'placedAt,desc' },
    });
    return response.data;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const response = await apiClient.get(`/customer/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId: number, reason: string): Promise<Order> {
    const response = await apiClient.put(`/customer/orders/${orderId}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  }

  async getFilteredOrders(status?: OrderStatus, fromDate?: string, toDate?: string, page = 0, size = 10) {
    const response = await apiClient.get('/customer/orders/filtered', {
      params: { status, fromDate, toDate, page, size },
    });
    return response.data;
  }

  async reorder(orderId: number, addressId?: number): Promise<Order> {
    const response = await apiClient.post(`/customer/orders/${orderId}/reorder`, null, {
      params: { addressId },
    });
    return response.data;
  }
}

export default new OrderService();



