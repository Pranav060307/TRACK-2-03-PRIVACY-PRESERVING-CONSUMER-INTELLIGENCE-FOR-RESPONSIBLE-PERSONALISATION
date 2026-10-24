import type { Product, StoreCohort, MerchantKPIs, CustomerPrivacySettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Raw Organic Linen Overshirt',
    brand: 'Norden Tailors',
    category: 'Apparel',
    price: 110,
    rating: 4.8,
    reviewsCount: 64,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80',
    description: '100% GOTS certified organic linen crafted by local European ateliers. Unbleached and breathable.',
    privacyMatchReason: 'Matched because you enabled "Sustainable & Organic Materials" in your privacy vault.',
    zeroPartyTag: 'Organic Apparel',
    isEthicalSource: true
  },
  {
    id: 'prod-2',
    name: 'Noise-Isolating Aluminum Headphones',
    brand: 'SoundForm',
    category: 'Audio & Tech',
    price: 195,
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    description: 'Precision acoustic tuning with local on-device equalizer. Zero cloud mic listening telemetry.',
    privacyMatchReason: 'Recommended based on anonymous cohort preferences for repairable hardware.',
    zeroPartyTag: 'Hardware Privacy',
    isEthicalSource: true
  },
  {
    id: 'prod-3',
    name: 'Cold-Pressed Botanical Facial Serum',
    brand: 'Vera Botanics',
    category: 'Wellness',
    price: 48,
    rating: 4.7,
    reviewsCount: 89,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1608248597359-5775d71a1795?auto=format&fit=crop&w=700&q=80',
    description: 'Formulated with cold-pressed rosehip seed oil and squalane. Dermatologically certified clean.',
    privacyMatchReason: 'Matched to your stated zero-party preference for cruelty-free and clean skincare.',
    zeroPartyTag: 'Clean Skincare',
    isEthicalSource: true
  },
  {
    id: 'prod-4',
    name: 'Handcrafted Walnut Desk Catchall',
    brand: 'Studio Kobo',
    category: 'Home & Living',
    price: 64,
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=80',
    description: 'FSC-certified solid American walnut finished with natural beeswax. Hand-turned in small batches.',
    privacyMatchReason: 'Matched via local device cosine similarity for minimalist home aesthetic.',
    zeroPartyTag: 'Artisan Decor',
    isEthicalSource: true
  },
  {
    id: 'prod-5',
    name: 'Single-Origin Ethiopian Yirgacheffe Beans',
    brand: 'Forge Coffee Roasters',
    category: 'Groceries',
    price: 22,
    rating: 4.9,
    reviewsCount: 215,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80',
    description: 'Direct trade washed coffee beans with tasting notes of jasmine blossom and bergamot citrus.',
    privacyMatchReason: 'Selected by decentralized aggregate demand trend without tracking personal browsing habits.',
    zeroPartyTag: 'Direct Trade Food',
    isEthicalSource: true
  },
  {
    id: 'prod-6',
    name: 'Recycled Wool Minimalist Throw Blanket',
    brand: 'Fjord Goods',
    category: 'Home & Living',
    price: 85,
    rating: 4.6,
    reviewsCount: 51,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=700&q=80',
    description: 'Woven from recycled merino wool fibers in Portugal. Warm, breathable, and fully circular.',
    privacyMatchReason: 'Matched because you opted into circular economy product recommendations.',
    zeroPartyTag: 'Circular Economy',
    isEthicalSource: true
  }
];

export const INITIAL_CUSTOMER_SETTINGS: CustomerPrivacySettings = {
  anonymityLevel: 'balanced',
  epsilon: 0.7,
  shareAnonymizedCohorts: true,
  incognitoMode: false,
  zeroPartyPreferences: [
    { id: 'pref-1', label: 'Sustainable & Organic Materials', active: true, category: 'Apparel' },
    { id: 'pref-2', label: 'Cruelty-Free & Clean Skincare', active: true, category: 'Wellness' },
    { id: 'pref-3', label: 'Hardware Privacy & No Cloud Mics', active: true, category: 'Audio & Tech' },
    { id: 'pref-4', label: 'Budget Target: $50 - $150', active: true, category: 'General' },
    { id: 'pref-5', label: 'Circular & Repairable Products', active: false, category: 'Home & Living' }
  ]
};

export const INITIAL_STORE_COHORTS: StoreCohort[] = [
  {
    id: 'c-1',
    name: 'Eco-Conscious Lifestyle Buyers',
    targetCategory: 'Apparel & Home',
    trueCustomerCount: 1420,
    perturbedCount: 1432,
    laplaceNoise: 12,
    kAnonymity: 84,
    averageSpend: 142,
    trend: '+14%'
  },
  {
    id: 'c-2',
    name: 'Clean Skincare & Botanical Adopters',
    targetCategory: 'Wellness',
    trueCustomerCount: 890,
    perturbedCount: 881,
    laplaceNoise: -9,
    kAnonymity: 62,
    averageSpend: 68,
    trend: '+22%'
  },
  {
    id: 'c-3',
    name: 'Privacy-First Audio & Tech Shoppers',
    targetCategory: 'Audio & Tech',
    trueCustomerCount: 650,
    perturbedCount: 664,
    laplaceNoise: 14,
    kAnonymity: 58,
    averageSpend: 210,
    trend: '+8%'
  },
  {
    id: 'c-4',
    name: 'Specialty Direct-Trade Grocery Regulars',
    targetCategory: 'Groceries',
    trueCustomerCount: 2100,
    perturbedCount: 2105,
    laplaceNoise: 5,
    kAnonymity: 110,
    averageSpend: 46,
    trend: '+14%'
  }
];

export const INITIAL_MERCHANT_KPIS: MerchantKPIs = {
  totalRevenue: 54820,
  totalOrders: 642,
  anonymizedAdoptionRate: 88,
  averageOrderValue: 85.39,
  activeEdgeNodes: 1240,
  dpQueriesRun: 38
};
