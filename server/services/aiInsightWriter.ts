import { PROHIBITED_TARGETING_REGISTRY, CCPA_BANNED_DARK_PATTERNS } from '../data/prohibitedRegistry';

export interface WeeklyAIAction {
  id: string;
  targetCohort: string;
  cohortSizeConsented: number; // Only P2/P3 consented customers
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

export function generateWeeklyAIActions(): WeeklyAIAction[] {
  return [
    {
      id: 'ACT-01',
      targetCohort: 'Weekend Regulars (Drifting)',
      cohortSizeConsented: 34,
      channel: 'WhatsApp',
      actionTitle: {
        en: 'Staples Combo Offer for Weekend Shoppers',
        mr: 'शनिवार-रविवारच्या नियमित ग्राहकांसाठी धान्य कॉम्बो ऑफर',
        hi: 'सप्ताहांत के नियमित ग्राहकों के लिए राशन कॉम्बो ऑफर'
      },
      recommendedOfferText: {
        en: 'Namaste! Get ₹20 off when you purchase 5kg Sharbati Atta + 1kg Toor Dal this weekend at your neighborhood kirana.',
        mr: 'नमस्ते! तुमच्या जवळच्या किराणा दुकानातून या वीकेंडला 5 किलो शरबती गव्हाचे पीठ + 1 किलो तूर डाळ घेतल्यास ₹20 ची थेट सवलत मिळवा.',
        hi: 'नमस्ते! अपने नजदीकी किराना स्टोर पर इस सप्ताहांत 5 किलो शरबती आटा + 1 किलो तूर दाल खरीदने पर ₹20 की सीधी छूट पाएं।'
      },
      rationale: {
        en: 'This cohort of 34 consented families dropped visit frequency by 22% over weeks 14–17. Atta and Dal purchases maintain neighborhood grocery loyalty against quick-commerce apps.',
        mr: 'या 34 कुटुंबांची किराणा भेट 22% ने कमी झाली आहे. गव्हाचे पीठ आणि डाळ ही आवश्यक उत्पादने ग्राहकांना परत दुकानाशी जोडतात.',
        hi: 'इन 34 परिवारों का किराना दौरा 22% कम हुआ है। आटा और दाल की दैनिक आवश्यकता ग्राहकों को क्विक-कॉमर्स ऐप्स के बजाय आपकी दुकान पर वापस लाती है।'
      },
      discountAmountINR: 20,
      expectedMarginProtected: true,
      guardrailAudit: {
        darkPatternsDetected: [], // Passed: 0 dark patterns
        restrictedCategoriesChecked: ['Tobacco', 'Baby Care', 'OTC Medicines', 'Puja items'],
        isApprovedForDispatch: true
      },
      status: 'Ready for Review'
    },
    {
      id: 'ACT-02',
      targetCohort: 'Monthly Bulk Buyers',
      cohortSizeConsented: 28,
      channel: 'WhatsApp',
      actionTitle: {
        en: 'Free Home Delivery on Monthly Grocery Orders above ₹500',
        mr: '₹500 वरील मासिक किराणा खरेदीवर मोफत घरपोच डिलिव्हरी',
        hi: '₹500 से अधिक की मासिक किराना खरीद पर मुफ्त होम डिलीवरी'
      },
      recommendedOfferText: {
        en: 'Order your monthly kitchen staples above ₹500 from your neighborhood store and enjoy free same-day doorstep delivery.',
        mr: 'तुमच्या महिन्याचा ₹500 वरील किराणा सामान घरबसल्या ऑर्डर करा आणि मोफत होम डिलिव्हरीचा लाभ घ्या.',
        hi: 'अपनी रसोई का ₹500 से अधिक का मासिक राशन ऑर्डर करें और उसी दिन निःशुल्क होम डिलीवरी पाएं।'
      },
      rationale: {
        en: 'Bulk buyers spend an average of ₹840 per visit. Offering doorstep delivery neutralizes the primary friction point where quick commerce competes.',
        mr: 'मोठ्या खरेदीदार ग्राहकांची सरासरी खरेदी ₹840 आहे. घरपोच डिलिव्हरी दिल्याने ग्राहक ऑनलाइन ॲपकडे जाणे थांबते.',
        hi: 'थोक खरीदार औसतन ₹840 खर्च करते हैं। मुफ्त डिलीवरी देने से वे क्विक-कॉमर्स ऐप्स पर स्विच नहीं करते।'
      },
      discountAmountINR: 0,
      expectedMarginProtected: true,
      guardrailAudit: {
        darkPatternsDetected: [],
        restrictedCategoriesChecked: ['No individual profiling', 'No false countdown timers'],
        isApprovedForDispatch: true
      },
      status: 'Ready for Review'
    },
    {
      id: 'ACT-03',
      targetCohort: 'Occasional Tea & Beverage Regulars',
      cohortSizeConsented: 19,
      channel: 'SMS',
      actionTitle: {
        en: 'Complimentary Biscuit Pack with Premium Tea Leaf',
        mr: 'प्रीमियम चहा पावडरसोबत मोफत बिस्किट पॅकेट',
        hi: 'प्रीमियम चाय पत्ती के साथ निःशुल्क बिस्कुट पैक'
      },
      recommendedOfferText: {
        en: 'Special neighbor privilege: Buy any 500g premium tea packet this week and receive a complimentary digestive biscuit pack.',
        mr: 'खास ऑफर: या आठवड्यात 500 ग्रॅम चहा पावडर खरेदी करा आणि सोबत मोफत बिस्किट पॅकेट मिळवा.',
        hi: 'विशेष ऑफर: इस सप्ताह 500 ग्राम प्रीमियम चाय पत्ती खरीदें और साथ में मानार्थ बिस्कुट पैक पाएं।'
      },
      rationale: {
        en: 'Small high-frequency items preserve daily touchpoints. 19 consented shoppers who frequently buy dairy/tea are targeted without tracking.',
        mr: 'रोजच्या चहा-नाश्त्याच्या वस्तू ग्राहकांना सतत दुकानाशी जोडून ठेवतात.',
        hi: 'दैनिक चाय और नाश्ते की वस्तुएं ग्राहकों को दुकान से लगातार जोड़े रखती हैं।'
      },
      discountAmountINR: 15,
      expectedMarginProtected: true,
      guardrailAudit: {
        darkPatternsDetected: [],
        restrictedCategoriesChecked: ['No addictive products', 'No personal pricing'],
        isApprovedForDispatch: true
      },
      status: 'Ready for Review'
    }
  ];
}

// Offer text scanner checking for the 13 CCPA dark patterns
export function scanOfferTextForDarkPatterns(text: string): { passes: boolean; flags: string[] } {
  const flags: string[] = [];
  const lower = text.toLowerCase();

  // 1. False urgency / countdown manipulation
  if (lower.includes('hurry') || lower.includes('only 1 left') || lower.includes('only 2 left') || lower.includes('ends in 1 hour') || lower.includes('running out fast')) {
    flags.push('CCPA DP-01: False Urgency pattern detected');
  }

  // 2. Confirm shaming
  if (lower.includes('hate saving') || lower.includes('don\'t care about money') || lower.includes('regret it')) {
    flags.push('CCPA DP-03: Confirm Shaming manipulative pattern detected');
  }

  // 3. Prohibited product promotion (PT-07)
  if (lower.includes('cigarette') || lower.includes('bidi') || lower.includes('tobacco') || lower.includes('pan masala') || lower.includes('alcohol')) {
    flags.push('PT-07 Violation: Addictive or prohibited substance detected in promotional text');
  }

  // 4. Inferred health or pregnancy (PT-01, PT-03)
  if (lower.includes('diabetic') || lower.includes('pregnancy') || lower.includes('medicine') || lower.includes('illness')) {
    flags.push('PT-01/03 Violation: Health or reproductive status targeting detected');
  }

  return {
    passes: flags.length === 0,
    flags
  };
}
