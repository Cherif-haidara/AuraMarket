export type UserRole = 'client' | 'seller' | 'admin';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isAuraPrime: boolean;
  addresses: Address[];
  phone?: string;
  twoFactorEnabled: boolean;
}

export interface CarrierOption {
  name: 'Chronopost Express' | 'DHL Express' | 'FedEx Priority' | 'Colissimo Standard' | 'Livraison Locale';
  price: number;
  days: number;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  category: string;
  brand: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  badge?: 'Choix d\'Aura' | 'Meilleure Vente' | 'Offre Flash' | 'Prime' | 'Éco-responsable' | 'Nouveau';
  primeEligible: boolean;
  deliveryEtaDays: number;
  carrierOptions: CarrierOption[];
  tags: string[];
  salesVelocity: number; // units/week
  revenue: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCarrier?: CarrierOption;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export type OrderStatus =
  | 'En attente'
  | 'Payée'
  | 'Préparation'
  | 'Expédiée'
  | 'Livrée'
  | 'Annulée'
  | 'Remboursée';

export interface OrderTimelineStep {
  status: OrderStatus;
  date: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: Address;
  paymentMethod: 'card' | 'paypal' | 'stripe' | 'mobile_money' | 'cod' | 'gnf_mobile';
  paymentDetails?: {
    brand?: string;
    last4?: string;
    mobileOperator?: string;
    transactionId: string;
  };
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  fraudRiskScore: number; // 0 to 100
  fraudRiskTier: 'Faible' | 'Moyen' | 'Élevé';
  sellerIds: string[];
  timeline: OrderTimelineStep[];
}

export interface SellerProfile {
  id: string;
  storeName: string;
  logo: string;
  banner: string;
  email: string;
  phone: string;
  verified: boolean;
  commissionRate: number; // e.g. 0.12 (12%)
  totalRevenue: number;
  totalOrders: number;
  avgRating: number;
  joinedDate: string;
  responseRate: string;
  kycStatus: 'approved' | 'pending' | 'rejected';
  balanceAvailable: number;
  balancePending: number;
}

export interface PlatformMetric {
  gmv: number;
  netRevenue: number;
  totalOrders: number;
  activeUsers: number;
  activeSellers: number;
  conversionRate: number;
  pendingKyc: number;
  flaggedTransactions: number;
}

export interface Dispute {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  reason: string;
  status: 'Ouvert' | 'En examen' | 'Résolu' | 'Remboursé';
  date: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
}
