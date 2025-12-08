export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  DELIVERY_AGENT: 'DELIVERY_AGENT',
  ADMIN: 'ADMIN',
} as const;

export const ORDER_STATUS = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  ASSIGNED: 'Delivery Assigned',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY: 'bg-purple-100 text-purple-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  PICKED_UP: 'bg-pink-100 text-pink-800',
  OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};


