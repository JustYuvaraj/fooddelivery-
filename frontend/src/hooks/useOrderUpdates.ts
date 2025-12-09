import { useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { Order, OrderStatus } from '@/types/api.types';
import { toast } from 'react-hot-toast';

export const useOrderUpdates = (orderId: number | null) => {
  const [order, setOrder] = useState<Order | null>(null);

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrder(updatedOrder);
    
    // Show toast notifications for status changes
    const statusMessages: Record<OrderStatus, string> = {
      PLACED: 'Order placed successfully!',
      CONFIRMED: 'Order confirmed by restaurant',
      PREPARING: 'Restaurant is preparing your order',
      READY: 'Order is ready for pickup',
      ASSIGNED: 'Delivery agent assigned',
      PICKED_UP: 'Order picked up by delivery agent',
      OUT_FOR_DELIVERY: 'Order is out for delivery',
      DELIVERED: 'Order delivered! Enjoy your meal!',
      CANCELLED: 'Order cancelled',
    };

    if (updatedOrder.status && statusMessages[updatedOrder.status]) {
      toast.success(statusMessages[updatedOrder.status], {
        duration: 5000,
      });
    }
  };

  useWebSocket(
    orderId ? `/topic/orders/${orderId}` : '',
    handleOrderUpdate
  );

  return { order, setOrder };
};



