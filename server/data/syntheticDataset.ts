import crypto from 'crypto';

export interface RawCustomer {
  customerId: string;
  name: string;
  phone: string;
  locality?: string;
  customerType: 'daily' | 'weekly' | 'monthly' | 'occasional';
  willLapse: boolean;
  registeredDate: string;
}

export interface ConsentRecord {
  customerId: string;
  phoneHash: string;
  p1Analytics: 'granted' | 'denied' | 'not_recorded' | 'withdrawn';
  p2WhatsApp: 'granted' | 'denied' | 'not_recorded' | 'withdrawn';
  p3SMS: 'granted' | 'denied' | 'not_recorded' | 'withdrawn';
  isDeleted: boolean;
  noticeLanguage: 'Marathi' | 'Hindi' | 'English';
  channel: 'QR self-service' | 'Counter billing' | 'SMS prompt';
  lastUpdated: string;
}

export interface ConsentEvent {
  id: string;
  phoneHash: string;
  purpose: 'P1' | 'P2' | 'P3' | 'ALL_ERASURE';
  action: 'grant' | 'denial' | 'withdrawal' | 'erasure_requested' | 'erasure_completed';
  timestamp: string;
}

export interface RawBillLine {
  billId: string;
  customerId?: string; // empty for walk-ins
  phone?: string;
  timestamp: string;
  item: string;
  category: string;
  quantity: number;
  amount: number;
  paymentMode: 'UPI' | 'Cash' | 'Credit (khata)';
}

export interface MinimisedBill {
  billId: string;
  keyedHashId: string; // empty if no P1 consent or walk-in
  weekNumber: number;
  categoryGroup: string; // 'Staples', 'Dairy & Bakery', 'Restricted', etc.
  amountBand: '0–200' | '200–500' | '500–1,000' | '1,000+';
  consentBasis: 'P1-Consented' | 'Anonymous Walk-in' | 'No-P1-Anonymous';
}

// Secret key for HMAC-SHA256 (held in key vault, rotated every 12 months)
export const SHOP_HMAC_SECRET = process.env.HMAC_SECRET_SALT || 'shop_secret_vault_key_2026_salt_99812';

export function computeKeyedHash(phone: string): string {
  if (!phone) return '';
  return crypto.createHmac('sha256', SHOP_HMAC_SECRET).update(phone).digest('hex').substring(0, 16);
}

// Pre-generated Seed 2026 Synthetic Kirana Dataset
function generateSyntheticKiranaShop() {
  const customers: RawCustomer[] = [];
  const consentRecords: ConsentRecord[] = [];
  const consentEvents: ConsentEvent[] = [];
  const rawBills: RawBillLine[] = [];
  const minimisedBills: MinimisedBill[] = [];

  const firstNames = ['Aarav', 'Rohan', 'Priya', 'Ananya', 'Sneha', 'Vikram', 'Aditi', 'Rajesh', 'Suresh', 'Kavita', 'Sunil', 'Pooja', 'Deepak', 'Nisha', 'Amit'];
  const lastNames = ['Jadhav', 'Patil', 'Deshmukh', 'Sharma', 'Kulkarni', 'Shinde', 'Chavan', 'Pawar', 'More', 'Gaikwad', 'Bhosale', 'Tambe'];

  // 1. Generate 600 Customers
  for (let i = 1; i <= 600; i++) {
    const custId = `CUST-${String(i).padStart(4, '0')}`;
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const phone = `+91-00${String(10000000 + i)}`; // Invalid +91-00 prefix ensures no real person matches
    const phoneHash = computeKeyedHash(phone);

    // Distribution: Daily 15%, Weekly 35%, Monthly 25%, Occasional 25%
    let customerType: 'daily' | 'weekly' | 'monthly' | 'occasional' = 'weekly';
    if (i <= 90) customerType = 'daily';
    else if (i <= 300) customerType = 'weekly';
    else if (i <= 450) customerType = 'monthly';
    else customerType = 'occasional';

    // 24% of daily and weekly cut visits (47 lapsers among consented)
    const willLapse = (customerType === 'daily' || customerType === 'weekly') && (i % 4 === 0);

    customers.push({
      customerId: custId,
      name: `${fn} ${ln}`,
      phone,
      locality: i % 3 === 0 ? 'Station Road' : i % 3 === 1 ? 'Market Ward' : 'Shivaji Nagar',
      customerType,
      willLapse,
      registeredDate: '2026-04-06'
    });

    // Consent assignment
    // P1: 65.2% granted, 12.7% denied, 16.5% not recorded, 5.7% withdrawn
    let p1: 'granted' | 'denied' | 'not_recorded' | 'withdrawn' = 'granted';
    if (i > 391 && i <= 467) p1 = 'denied';
    else if (i > 467 && i <= 566) p1 = 'not_recorded';
    else if (i > 566) p1 = 'withdrawn';

    // 11 customers requested deletion
    const isDeleted = i <= 11;

    let p2: 'granted' | 'denied' | 'not_recorded' | 'withdrawn' = 'denied';
    if (p1 === 'granted' && i % 3 === 0) p2 = 'granted';

    let p3: 'granted' | 'denied' | 'not_recorded' | 'withdrawn' = 'denied';
    if (p1 === 'granted' && i % 8 === 0) p3 = 'granted';

    consentRecords.push({
      customerId: custId,
      phoneHash,
      p1Analytics: isDeleted ? 'withdrawn' : p1,
      p2WhatsApp: isDeleted ? 'denied' : p2,
      p3SMS: isDeleted ? 'denied' : p3,
      isDeleted,
      noticeLanguage: i % 3 === 0 ? 'Marathi' : i % 3 === 1 ? 'Hindi' : 'English',
      channel: i % 2 === 0 ? 'QR self-service' : 'Counter billing',
      lastUpdated: '2026-04-06'
    });

    // Consent events
    consentEvents.push({
      id: `EVT-${i}`,
      phoneHash,
      purpose: 'P1',
      action: isDeleted ? 'erasure_requested' : p1 === 'granted' ? 'grant' : p1 === 'denied' ? 'denial' : 'withdrawal',
      timestamp: '2026-04-06T10:00:00Z'
    });
  }

  // 2. Generate Bills across 26 weeks
  const categories = [
    'Staples (Atta, Rice, Dal)',
    'Dairy & Bakery',
    'Snacks & Biscuits',
    'Beverages (Tea, Coffee)',
    'Personal Care',
    'Home Care',
    'Packaged Foods',
    'OTC Health (Medicines)',    // Sensitive -> Relabeled 'Restricted'
    'Baby Care & Diapers',       // Sensitive -> Relabeled 'Restricted'
    'Puja & Religious Items',    // Sensitive -> Relabeled 'Restricted'
    'Tobacco & Pan'              // Sensitive -> Relabeled 'Restricted'
  ];

  let billCount = 1;

  for (let week = 1; week <= 26; week++) {
    // Iterate customers
    customers.forEach(cust => {
      // Determine if customer shops this week
      let visits = 0;
      if (cust.customerType === 'daily') visits = 4;
      else if (cust.customerType === 'weekly') visits = 1;
      else if (cust.customerType === 'monthly') visits = (week % 4 === 1 ? 1 : 0);
      else visits = (week % 8 === 1 ? 1 : 0);

      // If customer lapses, visits drop by 85% after week 12
      if (cust.willLapse && week >= 12) {
        if (Math.random() > 0.15) visits = 0;
      }

      // Festival week 24 multiplier
      if (week === 24) visits = Math.round(visits * 1.4);

      for (let v = 0; v < visits; v++) {
        const billId = `BILL-${billCount++}`;
        const rawAmount = Math.floor(60 + Math.random() * 240); // ₹60 to ₹300, median ~₹119
        const paymentMode: 'UPI' | 'Cash' | 'Credit (khata)' = Math.random() < 0.62 ? 'UPI' : Math.random() < 0.85 ? 'Cash' : 'Credit (khata)';
        const cat = categories[Math.floor(Math.random() * categories.length)];

        // T1 Raw Bill Line
        rawBills.push({
          billId,
          customerId: cust.customerId,
          phone: cust.phone,
          timestamp: `2026-W${String(week).padStart(2, '0')}-D${v + 1}`,
          item: cat.split(' ')[0],
          category: cat,
          quantity: 1 + Math.floor(Math.random() * 3),
          amount: rawAmount,
          paymentMode
        });

        // T2 Minimised Bill (Drop name, drop payment mode, hash phone if consented)
        const consent = consentRecords.find(c => c.customerId === cust.customerId);
        const hasP1 = consent && consent.p1Analytics === 'granted' && !consent.isDeleted;

        // Amount banding per Challenge 1 spec: 0–200, 200–500, 500–1,000, 1,000+
        let amountBand: '0–200' | '200–500' | '500–1,000' | '1,000+' = '0–200';
        if (rawAmount > 1000) amountBand = '1,000+';
        else if (rawAmount > 500) amountBand = '500–1,000';
        else if (rawAmount > 200) amountBand = '200–500';

        // Sensitive category relabelling: OTC health, baby care, puja, tobacco -> 'Restricted'
        let cleanCategory = cat;
        if (cat.includes('OTC') || cat.includes('Baby') || cat.includes('Puja') || cat.includes('Tobacco')) {
          cleanCategory = 'Restricted';
        }

        minimisedBills.push({
          billId,
          keyedHashId: hasP1 ? cust.phone : computeKeyedHash(cust.phone),
          weekNumber: week,
          categoryGroup: cleanCategory,
          amountBand,
          consentBasis: hasP1 ? 'P1-Consented' : 'No-P1-Anonymous'
        });
      }
    });

    // 18% walk-in anonymous bills with no phone
    for (let w = 0; w < 40; w++) {
      const billId = `BILL-${billCount++}`;
      const rawAmount = Math.floor(40 + Math.random() * 180);
      rawBills.push({
        billId,
        timestamp: `2026-W${String(week).padStart(2, '0')}-WALK`,
        item: 'Staples',
        category: 'Staples (Atta, Rice, Dal)',
        quantity: 1,
        amount: rawAmount,
        paymentMode: 'Cash'
      });

      minimisedBills.push({
        billId,
        keyedHashId: '', // Walk-in has no ID
        weekNumber: week,
        categoryGroup: 'Staples (Atta, Rice, Dal)',
        amountBand: rawAmount > 200 ? '200–500' : '0–200',
        consentBasis: 'Anonymous Walk-in'
      });
    }
  }

  return { customers, consentRecords, consentEvents, rawBills, minimisedBills };
}

export const SYNTHETIC_STORE = generateSyntheticKiranaShop();
