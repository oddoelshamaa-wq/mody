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

// ---------------------------------------------------------
// منطقة تعديل قائمة الطعام الافتراضية
// يمكنك تغيير الأسماء، الأسعار، والصور هنا
// ---------------------------------------------------------
const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'برجر نجف الخاص', 
    description: 'قطعة لحم بلدي مشوية مع صوص نجف السري والجبنة السويسرية', 
    price: 85, 
    category: 'برجر', 
    image: 'https://picsum.photos/400/400?random=1' 
  },
  { 
    id: '2', 
    name: 'بيتزا سوبريم', 
    description: 'عجينة رقيقة مقرمشة مع خضروات طازجة وبيبروني', 
    price: 120, 
    category: 'بيتزا', 
    image: 'https://picsum.photos/400/400?random=2' 
  },
  { 
    id: '3', 
    name: 'باستا ألفريدو', 
    description: 'مكرونة فيتوتشيني مع صوص الكريمة والدجاج', 
    price: 95, 
    category: 'مكرونة', 
    image: 'https://picsum.photos/400/400?random=3' 
  },
  { 
    id: '4', 
    name: 'كولا باردة', 
    description: 'مشروب غازي منعش مع الثلج', 
    price: 15, 
    category: 'مشروبات', 
    image: 'https://picsum.photos/400/400?random=4' 
  },
];
// ---------------------------------------------------------

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // Load products from LocalStorage if available AND not empty, otherwise use INITIAL_PRODUCTS
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If parsed is an array and has items, use it. Otherwise use initial.
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load products from storage", e);
    }
    return INITIAL_PRODUCTS;
  });
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sound Effect Configuration
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Sound type: 'sine', 'square', 'sawtooth', 'triangle'
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio context not supported", e);
    }
  };

  // Sync Data to Browser LocalStorage (Persistence)
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Real-time Simulation (Check for new orders every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        try {
          const parsedOrders: Order[] = JSON.parse(storedOrders);
          if (parsedOrders.length > orders.length) {
              setOrders(parsedOrders);
              // Play sound only for staff
              if (userRole && userRole !== UserRole.CUSTOMER) {
                  playNotificationSound();
              }
          }
        } catch (e) {
          // ignore parsing errors
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

    // Update local state and immediately force localStorage update for other tabs/roles
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const markOrderAsSeen = (orderId: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, isNew: false } : o);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
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