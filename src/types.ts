export type UserRole = 'customer' | 'restaurant' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export type BusinessCategory = 'restaurant' | 'glacier' | 'cafe' | 'snack';
export type City = 'Saly' | 'Mbour';
export type BusinessStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionPlan = 'basic' | 'standard' | 'premium';

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: BusinessCategory;
  city: City;
  address: string;
  phone: string;
  photos: string[];
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  openingHours: Record<string, string>;
  deliveryAvailable: boolean;
  deliveryFee: number;
  subscriptionPlan: SubscriptionPlan;
  status: BusinessStatus;
  createdAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MenuItem {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  photo?: string;
  category: string;
  available: boolean;
}

export type OrderStatus = 'sent' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  customerId: string;
  businessId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  deliveryFee: number;
  type: OrderType;
  status: OrderStatus;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  businessId: string;
  date: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  businessId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'reservation' | 'system';
  read: boolean;
  createdAt: string;
}
