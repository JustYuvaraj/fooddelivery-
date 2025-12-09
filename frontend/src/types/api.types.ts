// API Response Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_AGENT' | 'ADMIN';
  profileImageUrl?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  cuisineType?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  openingTime: string;
  closingTime: string;
  minOrderAmount: number;
  deliveryRadiusKm: number;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isAcceptingOrders: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
}

export interface Product {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isVeg?: boolean;
  isAvailable: boolean;
  prepTimeMinutes?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  deliveryAgentId?: number;
  status: OrderStatus;
  items: OrderItem[];
  itemsTotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  deliveryLatitude: number;
  deliveryLongitude: number;
  placedAt: string;
  confirmedAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedDeliveryTime?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialRequests?: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Address {
  id: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface ProfileDTO {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  profileImageUrl?: string;
  totalOrders?: number;
  totalCompletedOrders?: number;
}

export interface ReviewDTO {
  id: number;
  orderId: number;
  restaurantId: number;
  foodRating: number;
  deliveryRating?: number;
  comment?: string;
  createdAt: string;
}

export interface DeliveryDetailsDTO {
  assignmentId: number;
  orderId: number;
  orderNumber: string;
  status: string;
  restaurant: {
    id: number;
    name: string;
    phone: string;
    latitude: number;
    longitude: number;
    address: string;
    googleMapsLink: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
    latitude: number;
    longitude: number;
    address: string;
    googleMapsLink: string;
  };
  route: {
    distanceKm: number;
    estimatedTimeMinutes: number;
    directions: string;
  };
  items: OrderItem[];
  totalAmount: number;
  specialInstructions?: string;
}

export interface DeliveryAssignmentDTO {
  id: number;
  orderId: number;
  status: string;
  assignedAt?: string;
  acceptedAt?: string;
}
