import { computeKeyedHash, RawBillLine, MinimisedBill } from '../data/syntheticDataset';

export interface MinimisationResult {
  totalBillsProcessed: number;
  t1FieldsDropped: string[];
  t2FieldsRetained: string[];
  sensitiveCategoriesRelabelled: number;
  anonymisedWalkIns: number;
  consentedMinimisedBills: MinimisedBill[];
}

export function processT1ToT2Minimisation(bills: RawBillLine[]): MinimisationResult {
  let sensitiveCount = 0;
  let walkInCount = 0;

  const minimised: MinimisedBill[] = bills.map(bill => {
    // 1. Drop Name, Age, Gender, Locality, Payment mode, Khata balance
    // 2. Hash Phone with secret HMAC-SHA256 if available
    const keyedHashId = bill.phone ? computeKeyedHash(bill.phone) : '';
    if (!bill.phone) walkInCount++;

    // 3. Amount banding: 0–200, 200–500, 500–1,000, 1,000+
    let amountBand: '0–200' | '200–500' | '500–1,000' | '1,000+' = '0–200';
    if (bill.amount > 1000) amountBand = '1,000+';
    else if (bill.amount > 500) amountBand = '500–1,000';
    else if (bill.amount > 200) amountBand = '200–500';

    // 4. Sensitive category relabelling (AG-7, PT-01, PT-02, PT-03)
    let categoryGroup = bill.category;
    if (
      bill.category.includes('OTC') || 
      bill.category.includes('Baby') || 
      bill.category.includes('Puja') || 
      bill.category.includes('Tobacco')
    ) {
      categoryGroup = 'Restricted';
      sensitiveCount++;
    }

    // 5. Week number extraction
    const weekMatch = bill.timestamp.match(/W(\d+)/);
    const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 1;

    return {
      billId: bill.billId,
      keyedHashId,
      weekNumber,
      categoryGroup,
      amountBand,
      consentBasis: bill.phone ? 'P1-Consented' : 'Anonymous Walk-in'
    };
  });

  return {
    totalBillsProcessed: bills.length,
    t1FieldsDropped: ['name', 'phone (raw)', 'exact_time', 'item_sku', 'exact_amount', 'payment_mode', 'credit_khata_balance', 'birthday', 'locality', 'age', 'gender'],
    t2FieldsRetained: ['keyed_hash_id (HMAC-SHA256)', 'week_number', 'category_group (7 everyday + Restricted)', 'amount_band (4 bands)', 'consent_basis'],
    sensitiveCategoriesRelabelled: sensitiveCount,
    anonymisedWalkIns: walkInCount,
    consentedMinimisedBills: minimised
  };
}
