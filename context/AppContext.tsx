import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, UserRole, OrderStatus } from '../types';

interface AppContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (customerDetails: { name: string; phone: string; address: string; payment: 'CASH' | 'CARD' }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  playNotificationSound: () => void;
  markOrderAsSeen: (orderId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'برجر نجف الخاص', description: 'قطعة لحم بلدي مشوية مع صوص نجف السري والجبنة السويسرية', price: 85, category: 'برجر', image: 'https://picsum.photos/400/400?random=1' },
  { id: '2', name: 'بيتزا سوبريم', description: 'عجينة رقيقة مقرمشة مع خضروات طازجة وبيبروني', price: 120, category: 'بيتزا', image: 'https://picsum.photos/400/400?random=2' },
  { id: '3', name: 'باستا ألفريدو', description: 'مكرونة فيتوتشيني مع صوص الكريمة والدجاج', price: 95, category: 'مكرونة', image: 'https://picsum.photos/400/400?random=3' },
  { id: '4', name: 'كولا باردة', description: 'مشروب غازي منعش مع الثلج', price: 15, category: 'مشروبات', image: 'https://picsum.photos/400/400?random=4' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Sound Effect
  const playNotificationSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Simulate receiving orders (polling for demo purposes if multiple tabs were open, 
  // but here primarily to catch updates from the same session effectively)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const parsedOrders: Order[] = JSON.parse(storedOrders);
        if (parsedOrders.length > orders.length) {
            // New order detected from another tab/session
            setOrders(parsedOrders);
            if (userRole && userRole !== UserRole.CUSTOMER) {
                playNotificationSound();
            }
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [orders.length, userRole]);


  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (customerDetails: { name: string; phone: string; address: string; payment: 'CASH' | 'CARD' }) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
      items: [...cart],
      totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: OrderStatus.PENDING,
      paymentMethod: customerDetails.payment,
      createdAt: Date.now(),
      isNew: true
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    
    // Simulate notification if an admin was watching (mocked by same session for now)
    // In a real app, this would be a socket emit.
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const markOrderAsSeen = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isNew: false } : o));
  };

  return (
    <AppContext.Provider value={{
      userRole, setUserRole,
      products, addProduct,
      cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart,
      orders, placeOrder, updateOrderStatus, markOrderAsSeen,
      playNotificationSound
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};