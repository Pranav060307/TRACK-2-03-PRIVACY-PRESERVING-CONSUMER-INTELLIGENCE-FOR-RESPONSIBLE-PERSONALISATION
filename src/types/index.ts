export type AppPanel = 'customer' | 'shop-owner';
export type ThemeMode = 'light' | 'dark';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Apparel' | 'Audio & Tech' | 'Home & Living' | 'Wellness' | 'Groceries';
  price: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  image: string;
  description: string;
  privacyMatchReason: string;
  zeroPartyTag: string;
  isEthicalSource: boolean;
}

export interface CustomerPrivacySettings {
  anonymityLevel: 'low' | 'balanced' | 'high'; // maps to epsilon 1.5, 0.7, 0.2
  epsilon: number;
  shareAnonymizedCohorts: boolean;
  incognitoMode: boolean;
  zeroPartyPreferences: {
    id: string;
    label: string;
    active: boolean;
    category: string;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  anonymizedToken: string;
  zeroPartyDataAttached: string[];
  privacyGuarantee: string;
}

export interface StoreCohort {
  id: string;
  name: string;
  targetCategory: string;
  trueCustomerCount: number;
  perturbedCount: number;
  laplaceNoise: number;
  kAnonymity: number;
  averageSpend: number;
  trend: '+14%' | '+8%' | '+22%' | '-3%';
}

export interface MerchantKPIs {
  totalRevenue: number;
  totalOrders: number;
  anonymizedAdoptionRate: number; // e.g. 88%
  averageOrderValue: number;
  activeEdgeNodes: number;
  dpQueriesRun: number;
}
