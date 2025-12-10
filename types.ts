export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN', // مدير
  MANAGER = 'MANAGER', // ادمن/مشرف
  KITCHEN = 'KITCHEN' // متلقي الاوردرات
}

export enum OrderStatus {
  PENDING = 'PENDING', // انتظار
  PREPARING = 'PREPARING', // قيد التحضير
  READY = 'READY', // جاهز
  DELIVERED = 'DELIVERED', // تم التسليم
  CANCELLED = 'CANCELLED' // ملغي
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'CASH' | 'CARD';
  createdAt: number; // Timestamp
  isNew?: boolean; // For notification highlighting
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  dailySales: { name: string; sales: number }[];
}