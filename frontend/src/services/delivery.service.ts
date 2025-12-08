import apiClient from '@/utils/api';
import { DeliveryDetailsDTO, DeliveryAssignmentDTO } from '@/types/api.types';

class DeliveryService {
  async getAssignments(status?: string, page = 0, size = 10) {
    const response = await apiClient.get('/delivery/assignments', {
      params: { status, page, size },
    });
    return response.data;
  }

  async getDeliveryDetails(assignmentId: number): Promise<DeliveryDetailsDTO> {
    const response = await apiClient.get(`/delivery/assignments/${assignmentId}/details`);
    return response.data;
  }

  async acceptDelivery(orderId: number): Promise<DeliveryAssignmentDTO> {
    const response = await apiClient.post(`/delivery/assignments/${orderId}/accept`);
    return response.data;
  }

  async rejectDelivery(orderId: number, reason?: string): Promise<DeliveryAssignmentDTO> {
    const response = await apiClient.post(`/delivery/assignments/${orderId}/reject`, null, {
      params: { reason },
    });
    return response.data;
  }

  async updateLocation(latitude: number, longitude: number): Promise<void> {
    await apiClient.put('/delivery/location', { latitude, longitude });
  }

  async getActiveDeliveries(): Promise<DeliveryDetailsDTO[]> {
    const response = await apiClient.get('/delivery/active');
    return response.data;
  }

  async markPickedUp(orderId: number): Promise<DeliveryAssignmentDTO> {
    const response = await apiClient.put(`/delivery/orders/${orderId}/picked-up`);
    return response.data;
  }

  async markOutForDelivery(orderId: number): Promise<DeliveryAssignmentDTO> {
    const response = await apiClient.put(`/delivery/orders/${orderId}/out-for-delivery`);
    return response.data;
  }

  async markDelivered(orderId: number): Promise<DeliveryAssignmentDTO> {
    const response = await apiClient.put(`/delivery/orders/${orderId}/delivered`);
    return response.data;
  }

  async setOnlineStatus(online: boolean): Promise<void> {
    await apiClient.put('/delivery/status', null, {
      params: { online },
    });
  }
}

export default new DeliveryService();



