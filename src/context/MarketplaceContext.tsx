import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  UserRole,
  SellerProfile,
  Dispute,
  PlatformMetric,
  CarrierOption,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USER,
  INITIAL_SELLERS,
  INITIAL_DISPUTES,
  INITIAL_METRICS,
} from '../data/mockData';

export type CurrencyType = 'EUR' | 'USD' | 'XOF' | 'GNF';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface MarketplaceContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  // Currency & I18n
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (amount: number) => string;

  // Data
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sellers: SellerProfile[];
  setSellers: React.Dispatch<React.SetStateAction<SellerProfile[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  disputes: Dispute[];
  setDisputes: React.Dispatch<React.SetStateAction<Dispute[]>>;
  platformMetrics: PlatformMetric;
  setPlatformMetrics: React.Dispatch<React.SetStateAction<PlatformMetric>>;

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, carrier?: CarrierOption) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  cartSubtotal: number;
  cartShipping: number;
  cartTotal: number;
  cartCount: number;

  // Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  primeOnly: boolean;
  setPrimeOnly: (p: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;

  // Order Operations
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Product Operations (Sellers/Admin)
  addProduct: (product: Omit<Product, 'id' | 'revenue' | 'salesVelocity'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // UI & Toasts
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Currency
  const [currency, setCurrency] = useState<CurrencyType>('EUR');

  // Core Data loaded from localStorage if exists
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('auramarket_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('auramarket_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sellers, setSellers] = useState<SellerProfile[]>(() => {
    const saved = localStorage.getItem('auramarket_sellers');
    return saved ? JSON.parse(saved) : INITIAL_SELLERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('auramarket_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem('auramarket_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetric>(() => {
    const saved = localStorage.getItem('auramarket_metrics');
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('auramarket_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('auramarket_wishlist');
    return saved ? JSON.parse(saved) : ['prod-001', 'prod-003'];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedBrand, setSelectedBrand] = useState('Toutes');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // UI state
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('auramarket_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('auramarket_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('auramarket_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('auramarket_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast Helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Currency Formatter
  const formatPrice = (amount: number): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount * 1.08);
    }
    if (currency === 'XOF') {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount * 655.957);
    }
    if (currency === 'GNF') {
      return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(amount * 9350)) + ' FG';
    }
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, carrier?: CarrierOption) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedCarrier: carrier || product.carrierOptions[0] }];
    });
    addToast({
      type: 'success',
      title: 'Ajouté au panier !',
      message: `${quantity}x ${product.name.slice(0, 38)}...`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast({
      type: 'info',
      title: 'Article retiré',
      message: 'Le produit a été retiré de votre panier.',
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Cart totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Prime members or free shipping over 35€
  const cartShipping = user.isAuraPrime || cartSubtotal >= 35 || cart.length === 0 ? 0 : 4.99;

  let couponDiscount = 0;
  if (appliedCoupon === 'WELCOME20') {
    couponDiscount = Math.min(20, cartSubtotal);
  } else if (appliedCoupon === 'AMAZON10') {
    couponDiscount = cartSubtotal * 0.10;
  } else if (appliedCoupon === 'FLASH50' && cartSubtotal >= 200) {
    couponDiscount = 50;
  }

  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + (cart.length > 0 ? cartShipping : 0));

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'WELCOME20') {
      setAppliedCoupon('WELCOME20');
      addToast({ type: 'success', title: 'Coupon appliqué !', message: '20€ de remise immédiate accordée.' });
      return { success: true, message: 'Code WELCOME20 appliqué (-20€)' };
    }
    if (clean === 'AMAZON10') {
      setAppliedCoupon('AMAZON10');
      addToast({ type: 'success', title: 'Coupon appliqué !', message: '10% de réduction appliqués sur votre panier.' });
      return { success: true, message: 'Code AMAZON10 appliqué (-10%)' };
    }
    if (clean === 'FLASH50') {
      if (cartSubtotal < 200) {
        return { success: false, message: 'Le code FLASH50 nécessite un panier minimum de 200€.' };
      }
      setAppliedCoupon('FLASH50');
      addToast({ type: 'success', title: 'Coupon VIP appliqué !', message: '50€ de remise exceptionnelle !' });
      return { success: true, message: 'Code FLASH50 appliqué (-50€)' };
    }
    return { success: false, message: 'Code promotionnel invalide ou expiré.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast({ type: 'info', title: 'Retiré des favoris', message: 'Le produit a été retiré de votre liste d\'envies.' });
        return prev.filter((id) => id !== productId);
      } else {
        addToast({ type: 'success', title: 'Ajouté à la liste d\'envies', message: 'Vous recevrez une notification en cas de baisse de prix.' });
        return [...prev, productId];
      }
    });
  };

  // Filter Reset
  const resetFilters = () => {
    setSelectedCategory('Toutes');
    setSelectedBrand('Toutes');
    setPriceRange([0, 3000]);
    setMinRating(0);
    setPrimeOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Order creation
  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNumber = `#FR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Payée',
      items: [...cart],
      subtotal: cartSubtotal,
      shippingFee: cartShipping,
      discountAmount: couponDiscount,
      taxAmount: cartSubtotal * 0.20,
      totalAmount: cartTotal,
      couponCode: appliedCoupon || undefined,
      shippingAddress: orderData.shippingAddress || user.addresses[0],
      paymentMethod: orderData.paymentMethod || 'card',
      paymentDetails: orderData.paymentDetails || {
        brand: 'Visa / Mastercard',
        last4: '4242',
        transactionId: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      },
      carrier: orderData.carrier || 'Chronopost Express',
      trackingNumber: `FR-CHRONO-${Math.floor(100000000 + Math.random() * 900000000)}`,
      estimatedDelivery: 'Demain avant 13h00',
      fraudRiskScore: Math.floor(5 + Math.random() * 15),
      fraudRiskTier: 'Faible',
      sellerIds: Array.from(new Set(cart.map((c) => c.product.sellerId))),
      timeline: [
        { status: 'En attente', date: 'Aujourd\'hui à l\'instant', description: 'Commande passée et vérification automatique', completed: true },
        { status: 'Payée', date: 'Aujourd\'hui à l\'instant', description: 'Paiement sécurisé approuvé par AuraShield', completed: true, current: true },
        { status: 'Préparation', date: 'En attente', description: 'Transmission aux hubs logistiques des vendeurs', completed: false },
        { status: 'Expédiée', date: 'Estimé: Demain matin', description: 'Prise en charge par le transporteur', completed: false },
        { status: 'Livrée', date: 'Estimé: Demain avant 13h', description: 'Remise en main propre contre signature', completed: false },
      ],
      ...orderData,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update product stock and revenue
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.product.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          return {
            ...prod,
            stock: newStock,
            salesVelocity: prod.salesVelocity + cartItem.quantity,
            revenue: prod.revenue + prod.price * cartItem.quantity,
          };
        }
        return prod;
      })
    );

    // Update platform metrics
    setPlatformMetrics((prev) => ({
      ...prev,
      gmv: prev.gmv + cartTotal,
      netRevenue: prev.netRevenue + cartTotal * 0.12,
      totalOrders: prev.totalOrders + 1,
    }));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = order.timeline.map((step) => {
            if (step.status === status) {
              return { ...step, completed: true, current: true, date: 'À l\'instant' };
            }
            return step;
          });
          return { ...order, status, updatedAt: new Date().toISOString(), timeline: updatedTimeline };
        }
        return order;
      })
    );
    addToast({
      type: 'success',
      title: 'Statut mis à jour',
      message: `La commande a été passée au statut : ${status}`,
    });
  };

  // Product management (sellers & admin)
  const addProduct = (productData: Omit<Product, 'id' | 'revenue' | 'salesVelocity'>) => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      salesVelocity: 0,
      revenue: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast({
      type: 'success',
      title: 'Produit publié !',
      message: `Le produit "${newProduct.name.slice(0, 30)}..." est désormais en ligne sur la marketplace.`,
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addToast({
      type: 'success',
      title: 'Produit modifié',
      message: 'Les modifications ont été enregistrées avec succès.',
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast({
      type: 'info',
      title: 'Produit supprimé',
      message: 'Le produit a été retiré du catalogue.',
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        currency,
        setCurrency,
        formatPrice,
        user,
        setUser,
        products,
        setProducts,
        sellers,
        setSellers,
        orders,
        setOrders,
        disputes,
        setDisputes,
        platformMetrics,
        setPlatformMetrics,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        cartSubtotal,
        cartShipping,
        cartTotal,
        cartCount,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        primeOnly,
        setPrimeOnly,
        sortBy,
        setSortBy,
        resetFilters,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        isAiChatOpen,
        setIsAiChatOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
