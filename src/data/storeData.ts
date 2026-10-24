import type { Product, StoreCohort, MerchantKPIs, CustomerPrivacySettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kirana-1',
    name: 'Sharbati Whole Wheat Atta (5 kg)',
    brand: 'Aashirvaad Select',
    category: 'Groceries',
    price: 245,
    rating: 4.9,
    reviewsCount: 312,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    description: '100% MP Sharbati grains. Ground in small batches to preserve natural grain sweetness and softness.',
    privacyMatchReason: 'Matched because your household frequency indicates weekly kitchen pantry replenishment.',
    zeroPartyTag: 'Daily Staples',
    isEthicalSource: true
  },
  {
    id: 'kirana-2',
    name: 'Unpolished Desi Toor Dal (1 kg)',
    brand: 'Tata Sampann',
    category: 'Groceries',
    price: 165,
    rating: 4.8,
    reviewsCount: 194,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
    description: 'Naturally protein-rich, unpolished lentils sourced directly from certified farmer cooperatives.',
    privacyMatchReason: 'Suggested as a staple pairing based on aggregated weekend grocery cohorts.',
    zeroPartyTag: 'Protein Staples',
    isEthicalSource: true
  },
  {
    id: 'kirana-3',
    name: 'Wagh Bakri Premium CTC Leaf Tea (500g)',
    brand: 'Wagh Bakri',
    category: 'Groceries',
    price: 260,
    rating: 4.9,
    reviewsCount: 420,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
    description: 'Strong, aromatic Assam CTC tea blend preferred across Indian households for traditional morning chai.',
    privacyMatchReason: 'Popular staple across the neighborhood active breakfast buyer segment.',
    zeroPartyTag: 'Beverages',
    isEthicalSource: true
  },
  {
    id: 'kirana-4',
    name: 'Pure Desi Cow Ghee (500 ml)',
    brand: 'Amul Vedic Gold',
    category: 'Wellness',
    price: 360,
    rating: 4.9,
    reviewsCount: 280,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=700&q=80',
    description: 'Traditional bilona-churned golden cow ghee with rich aroma and high smoke point.',
    privacyMatchReason: 'Matched to your zero-party preference for traditional unadulterated kitchen essentials.',
    zeroPartyTag: 'Pure Dairy',
    isEthicalSource: true
  },
  {
    id: 'kirana-5',
    name: 'Fortune Kachi Ghani Mustard Oil (1 L)',
    brand: 'Fortune Foods',
    category: 'Groceries',
    price: 155,
    rating: 4.7,
    reviewsCount: 160,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80',
    description: 'Cold-pressed authentic mustard oil preserving pungency and natural antioxidants.',
    privacyMatchReason: 'Aggregate monthly staple basket recommendation without tracking individual identity.',
    zeroPartyTag: 'Cooking Oils',
    isEthicalSource: true
  },
  {
    id: 'kirana-6',
    name: 'Natural Neem & Turmeric Bath Bar (Pack of 3)',
    brand: 'Medimix Ayurvedic',
    category: 'Wellness',
    price: 110,
    rating: 4.8,
    reviewsCount: 115,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1608248597359-5775d71a1795?auto=format&fit=crop&w=700&q=80',
    description: 'Traditional herbal formulation with 18 therapeutic botanical extracts for healthy skin.',
    privacyMatchReason: 'Matched because you enabled clean Ayurvedic personal care preferences.',
    zeroPartyTag: 'Ayurvedic Care',
    isEthicalSource: true
  }
];

export const INITIAL_CUSTOMER_SETTINGS: CustomerPrivacySettings = {
  anonymityLevel: 'balanced',
  epsilon: 0.5,
  shareAnonymizedCohorts: true,
  incognitoMode: false,
  zeroPartyPreferences: [
    { id: 'pref-1', label: 'Staples & Kitchen Essentials (Atta, Dal, Rice)', active: true, category: 'Groceries' },
    { id: 'pref-2', label: 'Fresh Dairy & Pure Ghee', active: true, category: 'Wellness' },
    { id: 'pref-3', label: 'Monthly Bulk Discounts (Orders > ₹500)', active: true, category: 'General' },
    { id: 'pref-4', label: 'Ayurvedic & Chemical-Free Personal Care', active: true, category: 'Wellness' },
    { id: 'pref-5', label: 'Festival & Seasonal Specials', active: false, category: 'Groceries' }
  ]
};

export const INITIAL_STORE_COHORTS: StoreCohort[] = [
  {
    id: 'c-1',
    name: 'Loyal regulars',
    targetCategory: 'Staples & Dairy',
    trueCustomerCount: 113,
    perturbedCount: 112,
    laplaceNoise: -1,
    kAnonymity: 112,
    averageSpend: 320,
    trend: '+14%'
  },
  {
    id: 'c-2',
    name: 'Monthly bulk buyers',
    targetCategory: 'Kitchen Staples',
    trueCustomerCount: 111,
    perturbedCount: 112,
    laplaceNoise: 1,
    kAnonymity: 112,
    averageSpend: 840,
    trend: '+8%'
  },
  {
    id: 'c-3',
    name: 'Occasional, active',
    targetCategory: 'Snacks & Chai',
    trueCustomerCount: 51,
    perturbedCount: 49,
    laplaceNoise: -2,
    kAnonymity: 49,
    averageSpend: 180,
    trend: '+22%'
  },
  {
    id: 'c-4',
    name: 'Drifting & Dormant Regulars (Merged)',
    targetCategory: 'General Pantry',
    trueCustomerCount: 58,
    perturbedCount: 54,
    laplaceNoise: -4,
    kAnonymity: 54,
    averageSpend: 280,
    trend: '-18%'
  }
];

export const INITIAL_MERCHANT_KPIS: MerchantKPIs = {
  totalRevenue: 54820,
  totalOrders: 642,
  anonymizedAdoptionRate: 88,
  averageOrderValue: 160.00, // Calibrated to kirana ₹100–200 range
  activeEdgeNodes: 383,      // 383 consented usable customers
  dpQueriesRun: 42
};
