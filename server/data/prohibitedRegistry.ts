export interface ProhibitedRule {
  id: string;
  practice: string;
  kiranaExample: string;
  whyBanned: string;
  enforcingControl: string;
}

export const PROHIBITED_TARGETING_REGISTRY: ProhibitedRule[] = [
  {
    id: 'PT-01',
    practice: 'Targeting on inferred health',
    kiranaExample: 'Discount on sugar-free items to "probable diabetics"',
    whyBanned: 'Health is special-category; severe harm if wrong or leaked',
    enforcingControl: 'Restricted categories cannot define groups'
  },
  {
    id: 'PT-02',
    practice: 'Targeting on religion, caste or community',
    kiranaExample: 'Festival offer only to buyers of certain puja items',
    whyBanned: 'Discrimination; deep social harm',
    enforcingControl: 'Restricted categories; no community or demographic fields stored'
  },
  {
    id: 'PT-03',
    practice: 'Pregnancy or family-status inference',
    kiranaExample: 'Baby product offers after pregnancy-test or diaper purchases',
    whyBanned: 'Exposes private family life',
    enforcingControl: 'Restricted category relabeling at ingestion'
  },
  {
    id: 'PT-04',
    practice: 'Targeting children',
    kiranaExample: 'Sweets or snack offers aimed directly at school-age children',
    whyBanned: 'India DPDP Act bars behavioural monitoring and targeted ads aimed at children',
    enforcingControl: 'No age data; automated offer text scanner'
  },
  {
    id: 'PT-05',
    practice: 'Exploiting financial distress',
    kiranaExample: 'Pushing credit or high-margin items to customers with unpaid khata',
    whyBanned: 'Preys on customer vulnerability',
    enforcingControl: 'Payment and credit/khata data never stored in T2 layer'
  },
  {
    id: 'PT-06',
    practice: 'Personalised (per-person) pricing',
    kiranaExample: 'Higher price for customers who "always come anyway"',
    whyBanned: 'Unfair; completely erodes neighborhood trust',
    enforcingControl: 'Offers are strictly per-group (k >= 10); no individual pricing exists'
  },
  {
    id: 'PT-07',
    practice: 'Promoting addictive products',
    kiranaExample: 'Discount on cigarettes, pan, or alcohol to win back a drifting group',
    whyBanned: 'Direct health harm and addiction promotion',
    enforcingControl: 'Tobacco, pan, and alcohol strictly excluded from all promotional offers'
  },
  {
    id: 'PT-08',
    practice: 'Dark patterns in offers',
    kiranaExample: '"Only 2 left, offer ends in 1 hour!" when completely false',
    whyBanned: '13 dark patterns banned by CCPA (Consumer Protection Authority)',
    enforcingControl: 'Automated offer text scanner before owner reviews or sends'
  },
  {
    id: 'PT-09',
    practice: 'Contact without or after consent withdrawal',
    kiranaExample: 'Sending WhatsApp offer to customer who withdrew P2 marketing consent',
    whyBanned: 'Violation of DPDP Act consent mandate',
    enforcingControl: 'Consent filter enforced at send-list creation time'
  },
  {
    id: 'PT-10',
    practice: 'Micro-segments (groups under 10)',
    kiranaExample: 'A "group" of 2 people that is really just one family',
    whyBanned: 'De-anonymises individuals into targeted profiling',
    enforcingControl: 'k >= 10 anonymity gate; smaller groups automatically suppressed'
  },
  {
    id: 'PT-11',
    practice: 'Location tracking or geofencing',
    kiranaExample: 'Sending alert when a customer walks past the kirana shop',
    whyBanned: 'Invasive surveillance far beyond legitimate grocery purpose',
    enforcingControl: 'No GPS, geofencing, or location SDKs exist in the system'
  },
  {
    id: 'PT-12',
    practice: 'Selling or sharing customer data',
    kiranaExample: 'Passing buyer lists to an FMCG brand or personal loan lender',
    whyBanned: 'Breaks purpose limitation, data fiduciary contract, and consumer trust',
    enforcingControl: 'No export of T1/T2 data; cryptographically enforced processor terms'
  },
  {
    id: 'PT-13',
    practice: 'Purchase data for credit eligibility decisions',
    kiranaExample: 'Rating a resident as "creditworthy" based on grocery basket history',
    whyBanned: 'High-stakes, opaque profiling outside primary retail purpose',
    enforcingControl: 'No scoring or credit outputs exist'
  },
  {
    id: 'PT-14',
    practice: 'Emotional or vulnerability manipulation',
    kiranaExample: 'Messages playing on fear or guilt ("Don\'t let your family run out of food")',
    whyBanned: 'Manipulative confirm-shaming banned under CCPA guidelines',
    enforcingControl: 'AI offer text sentiment and dark-pattern validator'
  },
  {
    id: 'PT-15',
    practice: 'Re-identifying people from group outputs',
    kiranaExample: 'Owner attempting to guess who is in a small cohort report',
    whyBanned: 'Defeats privacy by design',
    enforcingControl: 'Laplace noise on all counts and spend; no drill-down to individual rows'
  }
];

export const CCPA_BANNED_DARK_PATTERNS = [
  'false_urgency',      // e.g. "Hurry! Ends in 10 minutes", "Only 1 left!"
  'basket_sneaking',    // adding extra items without explicit opt-in
  'confirm_shaming',    // "No thanks, I hate saving money"
  'forced_action',      // forcing unneeded sign-ups
  'subscription_trap',  // difficult cancellation
  'interface_interference',
  'bait_and_switch',
  'drip_pricing',       // hidden charges revealed at checkout
  'disguised_ads',
  'nagging',            // repeated prompts after dismissal
  'trick_questions'
];
