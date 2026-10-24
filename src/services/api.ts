const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface HealthResponse {
  status: string;
  service: string;
  compliance: string;
  dataTiersEnforced: string[];
  activeEpsilon: number;
  totalSyntheticCustomers: number;
  usableModelCustomers: number;
}

export interface DataTier {
  tier: string;
  description: string;
  fields: string[];
  rule: string;
}

export interface ProhibitedRule {
  id: string;
  practice: string;
  kiranaExample: string;
  whyBanned: string;
  enforcingControl: string;
}

export interface MinimisedSampleResult {
  totalBillsProcessed: number;
  t1FieldsDropped: string[];
  t2FieldsRetained: string[];
  sensitiveCategoriesRelabelled: number;
  anonymisedWalkIns: number;
  consentedMinimisedBills: {
    billId: string;
    keyedHashId: string;
    weekNumber: number;
    categoryGroup: string;
    amountBand: string;
    consentBasis: string;
  }[];
}

export interface CohortData {
  cohortName: string;
  categoryFocus: string;
  trueSize: number;
  shownSize: number;
  laplaceNoise: number;
  marginOfError: number;
  status: 'released' | 'suppressed' | 'merged';
  explanation: string;
  averageWeeklySpend: number;
  rpr28Rate: number;
  earlyLapseRisk: 'Low' | 'Medium' | 'High';
}

export interface ChurnMetrics {
  coreMetricRPR28Current: number;
  coreMetricRPR28Baseline: number;
  rprDelta: number;
  earlyLapseDetectionRecall: number;
  earlyLapseDetectionPrecision: number;
  simpleRecencyRecall: number;
  offerUplift: number;
  winBackRate: number;
  optOutRateAfterOffer: number;
  prohibitedRegistryViolations: number;
}

export interface AIWeeklyAction {
  id: string;
  targetCohort: string;
  cohortSizeConsented: number;
  channel: 'WhatsApp' | 'SMS' | 'Counter Banner';
  actionTitle: {
    en: string;
    mr: string;
    hi: string;
  };
  recommendedOfferText: {
    en: string;
    mr: string;
    hi: string;
  };
  rationale: {
    en: string;
    mr: string;
    hi: string;
  };
  discountAmountINR: number;
  expectedMarginProtected: boolean;
  guardrailAudit: {
    darkPatternsDetected: string[];
    restrictedCategoriesChecked: string[];
    isApprovedForDispatch: boolean;
  };
  status: 'Ready for Review' | 'Dispatched' | 'Rejected';
}

export interface ReidentificationPoint {
  knownPurchasesCount: number;
  rawBillsIdentifiedPct: number;
  minimisedBillsIdentifiedPct: number;
  cohortLensIdentifiedPct: number;
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },

  async getDataBoundary(): Promise<{ tiers: DataTier[] }> {
    const res = await fetch(`${API_BASE_URL}/data-boundary`);
    return res.json();
  },

  async getProhibitedRegistry(): Promise<{ version: string; registry: ProhibitedRule[]; ccpaDarkPatterns: string[] }> {
    const res = await fetch(`${API_BASE_URL}/prohibited-registry`);
    return res.json();
  },

  async getMinimisationSample(): Promise<{ success: boolean; result: MinimisedSampleResult }> {
    const res = await fetch(`${API_BASE_URL}/pipeline/minimise`);
    return res.json();
  },

  async getCohorts(epsilon: number = 0.5): Promise<{ epsilon: number; anonymityThresholdK: number; cohorts: CohortData[] }> {
    const res = await fetch(`${API_BASE_URL}/cohorts?epsilon=${epsilon}`);
    return res.json();
  },

  async getMetrics(): Promise<ChurnMetrics> {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    return res.json();
  },

  async getAIActions(): Promise<{ actions: AIWeeklyAction[] }> {
    const res = await fetch(`${API_BASE_URL}/ai/actions`);
    return res.json();
  },

  async scanOfferText(text: string): Promise<{ text: string; passed: boolean; flags: string[] }> {
    const res = await fetch(`${API_BASE_URL}/ai/scan-offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async approveAction(actionId: string): Promise<{ success: boolean; message: string; action: AIWeeklyAction }> {
    const res = await fetch(`${API_BASE_URL}/ai/approve-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId })
    });
    return res.json();
  },

  async lookupConsent(phone: string): Promise<{
    phoneHash: string;
    found: boolean;
    p1Analytics: string;
    p2WhatsApp: string;
    p3SMS: string;
    isDeleted: boolean;
    noticeLanguage?: string;
    lastUpdated?: string;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/consent/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },

  async updateConsent(phone: string, p1?: string, p2?: string, p3?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/consent/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, p1, p2, p3 })
    });
    return res.json();
  },

  async requestDeletion(phone: string): Promise<{ success: boolean; step: string; workflow: string[]; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/consent/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },

  async getReidentificationTest(): Promise<{ benchmarkData: ReidentificationPoint[]; explanation: string; demographicUniquenessPct: number }> {
    const res = await fetch(`${API_BASE_URL}/experiment/reidentification`);
    return res.json();
  }
};
