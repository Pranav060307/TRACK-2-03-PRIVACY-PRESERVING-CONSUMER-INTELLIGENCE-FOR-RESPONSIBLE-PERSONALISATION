import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Lock, 
  Check, 
  Trash2, 
  Sliders, 
  HelpCircle,
  EyeOff,
  QrCode,
  Globe,
  ShieldCheck,
  Plus,
  Minus,
  MessageCircle,
  KeyRound
} from 'lucide-react';
import type { 
  Product, 
  CustomerPrivacySettings, 
  CartItem, 
  Order 
} from '../types';
import { api } from '../services/api';

interface CustomerPanelProps {
  products: Product[];
  settings: CustomerPrivacySettings;
  setSettings: React.Dispatch<React.SetStateAction<CustomerPrivacySettings>>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  privacyModalOpen: boolean;
  setPrivacyModalOpen: (open: boolean) => void;
  onCheckout: (order: Order) => void;
  addToast: (msg: string) => void;
  lang?: 'mr' | 'hi' | 'en';
  setLang?: (lang: 'mr' | 'hi' | 'en') => void;
}

export const CustomerPanel: React.FC<CustomerPanelProps> = ({
  products,
  settings,
  setSettings,
  cart,
  addToCart,
  removeFromCart,
  updateQuantity,
  cartOpen,
  setCartOpen,
  privacyModalOpen,
  setPrivacyModalOpen,
  onCheckout,
  addToast,
  lang: controlledLang,
  setLang: controlledSetLang
}) => {
  // 3-Language state: Marathi ('mr'), Hindi ('hi'), English ('en')
  const [internalLang, setInternalLang] = useState<'mr' | 'hi' | 'en'>('mr');
  const currentLang = controlledLang || internalLang;
  const setCurrentLang = controlledSetLang || setInternalLang;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [checkoutCompleteOrder, setCheckoutCompleteOrder] = useState<Order | null>(null);

  // Consent & Transparency QR Portal State (Features 1 & 2)
  const [qrPortalOpen, setQrPortalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('+91-0010000001');
  const [p1Consent, setP1Consent] = useState(true);
  const [p2Consent, setP2Consent] = useState(false);
  const [p3Consent, setP3Consent] = useState(false);
  const [phoneHashResult, setPhoneHashResult] = useState('');
  
  // OTP Verification state for Deletion (Feature 2)
  const [otpStep, setOtpStep] = useState<'initial' | 'otp_sent' | 'verified_deleted'>('initial');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [deletionSuccessWorkflow, setDeletionSuccessWorkflow] = useState<string[] | null>(null);
  const [erasureReceiptHash, setErasureReceiptHash] = useState<string>('');

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getProductCartQuantity = (productId: string) => {
    const found = cart.find(item => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  // Comprehensive 3-Language Translation Dictionary
  const t = {
    storeBadge: {
      mr: 'श्री गणेश किराणा • १००% खाजगी सुरक्षा',
      hi: 'श्री गणेश किराना • १००% निजी सुरक्षा',
      en: 'Shree Ganesh Kirana • 100% Privacy-Preserved'
    },
    dpdpNotice: {
      mr: 'DPDP Act २०२३ संमती गेट',
      hi: 'DPDP Act २०२३ सहमति गेट',
      en: 'DPDP Act 2023 Consent Gate'
    },
    heroTitle: {
      mr: 'घरपोच किराणा • शून्य ट्रॅकिंग हमी',
      hi: 'घरपहुंच किराना • शून्य ट्रैकिंग गारंटी',
      en: 'Doorstep Grocery • Zero Tracking Guarantee'
    },
    heroSubtitle: {
      mr: 'आम्ही तुमचा फोन नंबर, जीपीएस स्थान किंवा वैयक्तिक माहिती कधीही कोणाला विकत नाही. फक्त समूहाच्या मागणीनुसार दर्जेदार सामान पुरवतो.',
      hi: 'हम आपका फोन नंबर, जीपीएस स्थान या व्यक्तिगत जानकारी कभी किसी को नहीं बेचते। केवल समूह मांग के अनुसार गुणवत्तापूर्ण सामान लाते हैं।',
      en: 'We never profile, track location, or sell your personal data. Only aggregated group demand powers our neighborhood stock.'
    },
    btnPrivacy: {
      mr: 'काउंटर QR गोपनीयता व डिलीट',
      hi: 'काउंटर QR गोपनीयता और डिलीट',
      en: 'Counter QR & 1-Click Delete'
    },
    btnPreferences: {
      mr: 'माझ्या आवडी (Preferences)',
      hi: 'मेरी पसंद (Preferences)',
      en: 'Preferences Vault'
    },
    categories: {
      all: {
        mr: 'सर्व सामान (All)',
        hi: 'सभी सामान (All)',
        en: 'All Groceries'
      },
      groceries: {
        mr: 'धान्य, डाळी व तेल',
        hi: 'अनाज, दालें और तेल',
        en: 'Atta, Dals & Oils'
      },
      wellness: {
        mr: 'आरोग्य व स्वच्छता',
        hi: 'स्वास्थ्य और स्वच्छता',
        en: 'Wellness & Care'
      }
    },
    searchPlaceholder: {
      mr: 'किराणा शोधा (उदा. गहू, डाळ, तूप)...',
      hi: 'किराना खोजें (उदा. गेहूं, दाल, घी)...',
      en: 'Search groceries & staples...'
    },
    whyShown: {
      mr: 'हा पर्याय का सुचवला? (Privacy Match)',
      hi: 'यह विकल्प क्यों सुझाया गया? (Privacy Match)',
      en: 'Why was this recommended? (Privacy Match)'
    },
    addBtn: {
      mr: 'जोडा',
      hi: 'जोड़ें',
      en: 'Add'
    },
    floatingBag: {
      itemsSuffix: {
        mr: 'वस्तू',
        hi: 'सामान',
        en: 'items'
      },
      viewBag: {
        mr: 'पिशवी पहा →',
        hi: 'थैला देखें →',
        en: 'View Bag →'
      }
    },
    bagDrawer: {
      title: {
        mr: 'किराणा पिशवी',
        hi: 'किराना थैला',
        en: 'Grocery Bag'
      },
      empty: {
        mr: 'तुमची किराणा पिशवी रिकामी आहे.',
        hi: 'आपका किराना थैला खाली है।',
        en: 'Your grocery bag is empty.'
      },
      each: {
        mr: 'प्रत्येक',
        hi: 'प्रत्येक',
        en: 'each'
      },
      subtotal: {
        mr: 'सामान बेरीज:',
        hi: 'सामान योग:',
        en: 'Subtotal:'
      },
      delivery: {
        mr: 'घरपोच डिलिव्हरी:',
        hi: 'घरपहुंच डिलीवरी:',
        en: 'Doorstep Delivery:'
      },
      freeDelivery: {
        mr: 'मोफत घरपोच सेवा (Free)',
        hi: 'मुफ़्त घरपहुंच सेवा (Free)',
        en: 'Free Doorstep Delivery'
      },
      total: {
        mr: 'एकूण देय:',
        hi: 'कुल देय:',
        en: 'Total:'
      },
      orderWhatsApp: {
        mr: 'WhatsApp वर ऑर्डर पाठवा',
        hi: 'WhatsApp पर ऑर्डर भेजें',
        en: 'Order via WhatsApp'
      },
      confirmPrivate: {
        mr: 'खाजगी चेकआउट (Confirm Privately)',
        hi: 'निजी चेकआउट (Confirm Privately)',
        en: 'Confirm Privately'
      }
    },
    preferencesVault: {
      title: {
        mr: 'माझ्या आवडी (Customer Intent Vault)',
        hi: 'मेरी पसंद (Customer Intent Vault)',
        en: 'Customer Preferences Vault'
      },
      subtitle: {
        mr: 'तुम्हाला कोणत्या किराणा वस्तूंच्या सवलती हव्या आहेत ते स्वतः ठरवा (Zero-Party Data):',
        hi: 'आपको किन किराना वस्तुओं पर छूट चाहिए, स्वयं तय करें (Zero-Party Data):',
        en: 'You control what grocery categories our algorithm prioritizes locally without tracking:'
      },
      categoryLabel: {
        mr: 'श्रेणी:',
        hi: 'श्रेणी:',
        en: 'Category:'
      },
      incognitoTitle: {
        mr: 'गुप्त खरेदी मोड (Incognito)',
        hi: 'गुप्त खरीदारी मोड (Incognito)',
        en: 'Incognito Shopping Mode'
      },
      incognitoSub: {
        mr: 'टॅब बंद होताच सर्व टोकन्स नष्ट होतात',
        hi: 'टैब बंद होते ही सारे टोकन्स मिट जाते हैं',
        en: 'Wipes session tokens immediately upon browser tab close'
      },
      doneBtn: {
        mr: 'जतन करा (Done)',
        hi: 'सहेजें (Done)',
        en: 'Save & Close'
      }
    },
    receiptModal: {
      title: {
        mr: 'किराणा बिल पावती • १००% खाजगी',
        hi: 'किराना बिल रसीद • १००% निजी',
        en: 'Kirana Bill Receipt • Privacy Protected'
      },
      orderNo: {
        mr: 'ऑर्डर क्र:',
        hi: 'ऑर्डर क्र:',
        en: 'Order ID:'
      },
      totalAmount: {
        mr: 'एकूण रक्कम:',
        hi: 'कुल राशि:',
        en: 'Total Amount:'
      },
      tokenLabel: {
        mr: 'सुरक्षित टोकन:',
        hi: 'सुरक्षित टोकन:',
        en: 'Anonymized Token:'
      },
      attachedConsent: {
        mr: 'जोडलेली संमती:',
        hi: 'जुड़ी हुई पसंद:',
        en: 'Attached Intent Preferences:'
      },
      doneBtn: {
        mr: 'धन्यवाद! पुन्हा खरेदी करा',
        hi: 'धन्यवाद! फिर से खरीदारी करें',
        en: 'Done & Return to Shop'
      }
    },
    counterQRModal: {
      title: {
        mr: 'काउंटर QR संमती व १-क्लिक डिलीट केंद्र',
        hi: 'काउंटर QR सहमति व १-क्लिक डिलीट केंद्र',
        en: 'Counter QR Consent & 1-Click Erasure Portal'
      },
      noticeLangLabel: {
        mr: 'भाषा निवडा (Language):',
        hi: 'भाषा चुनें (Language):',
        en: 'Select Language (Rule 8):'
      },
      phoneLabel: {
        mr: 'ग्राहक फोन नंबर (डेमो खाते):',
        hi: 'ग्राहक फोन नंबर (डेमो खाता):',
        en: 'Customer Mobile Number (Demo Vault):'
      },
      checkBtn: {
        mr: 'तपासा (Check)',
        hi: 'जांचें (Check)',
        en: 'Check'
      },
      p1Title: {
        mr: 'P1: गट विश्लेषण संमती (Cohort Analytics)',
        hi: 'P1: समूह विश्लेषण सहमति (Cohort Analytics)',
        en: 'P1: Cohort Analytics Consent'
      },
      p1Sub: {
        mr: '१०+ लोकांच्या समूहात खरेदी जोडण्याची संमती (अॅपमध्ये साठवली जाते)',
        hi: '१०+ लोगों के समूह में खरीद जोड़ने की सहमति (ऐप में सहेजी जाती है)',
        en: 'Allow purchases to be aggregated into groups of 10+ shoppers'
      },
      p2Title: {
        mr: 'P2: WhatsApp वर सवलत मेसेज',
        hi: 'P2: WhatsApp पर छूट संदेश',
        en: 'P2: WhatsApp Group Offers'
      },
      p2Sub: {
        mr: 'किराणा सामानावर अधूनमधून सवलत मिळवण्यासाठी (P1 आवश्यक)',
        hi: 'किराना सामान पर कभी-कभी छूट पाने के लिए (P1 आवश्यक)',
        en: 'Receive occasional staple discounts on WhatsApp (requires P1)'
      },
      p3Title: {
        mr: 'P3: SMS वर सवलत मेसेज',
        hi: 'P3: SMS पर छूट संदेश',
        en: 'P3: SMS Group Offers'
      },
      p3Sub: {
        mr: 'स्थानिक किराणा सामानावर SMS सवलत मिळवण्यासाठी',
        hi: 'स्थानीय किराना सामान पर SMS छूट पाने के लिए',
        en: 'Receive occasional neighborhood SMS discounts'
      },
      saveConsentBtn: {
        mr: 'लेजरमध्ये संमती सेव्ह करा',
        hi: 'लेजर में सहमति सहेजें',
        en: 'Commit to Immutable Ledger'
      }
    }
  };

  const toggleZeroPartyPref = (prefId: string) => {
    setSettings(prev => ({
      ...prev,
      zeroPartyPreferences: prev.zeroPartyPreferences.map(p => 
        p.id === prefId ? { ...p, active: !p.active } : p
      )
    }));
    const toastMsg = currentLang === 'mr' 
      ? 'पसंती सुरक्षित सेव्ह झाली'
      : currentLang === 'hi'
      ? 'पसंद सुरक्षित रूप से सहेजी गई'
      : 'Preference saved locally in device enclave';
    addToast(toastMsg);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      total: cartTotal,
      anonymizedToken: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      zeroPartyDataAttached: settings.zeroPartyPreferences.filter(p => p.active).map(p => p.label),
      privacyGuarantee: `CohortLens Differential Privacy ε=${settings.epsilon} with zero personal profiling.`
    };

    onCheckout(newOrder);
    setCheckoutCompleteOrder(newOrder);
    setCartOpen(false);

    const toastMsg = currentLang === 'mr' 
      ? 'ऑर्डर सेव्ह झाली! गोपनीयता पावती तयार केली.'
      : currentLang === 'hi'
      ? 'ऑर्डर सहेज ली गई! गोपनीयता रसीद तैयार।'
      : 'Order placed! Privacy receipt generated.';
    addToast(toastMsg);
  };

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    const itemsList = cart.map(i => `${i.quantity}x ${i.product.name} (₹${i.product.price * i.quantity})`).join(', ');
    
    let textStr = '';
    if (currentLang === 'mr') {
      textStr = `नमस्ते श्री गणेश किराणा, माझी ऑर्डर:\n${itemsList}\nएकूण रक्कम: ₹${cartTotal}\nकृपया घरपोच पाठवा (Privacy Protected Order).`;
    } else if (currentLang === 'hi') {
      textStr = `नमस्ते श्री गणेश किराना, मेरा ऑर्डर:\n${itemsList}\nकुल राशि: ₹${cartTotal}\nकृपया घरपहुंच भेजें (Privacy Protected Order).`;
    } else {
      textStr = `Hello Shree Ganesh Kirana, my grocery order:\n${itemsList}\nTotal: ₹${cartTotal}\nPlease deliver to doorstep (Privacy Protected Order).`;
    }

    const encoded = encodeURIComponent(textStr);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    handleCheckout();
  };

  // QR Consent Lookup
  const handleLookupConsent = async () => {
    try {
      const res = await api.lookupConsent(customerPhone);
      setPhoneHashResult(res.phoneHash);
      setP1Consent(res.p1Analytics === 'granted');
      setP2Consent(res.p2WhatsApp === 'granted');
      setP3Consent(res.p3SMS === 'granted');
      setDeletionSuccessWorkflow(null);
      setOtpStep('initial');
    } catch {
      // Fallback
    }
  };

  // Save Consent to append-only ledger (Feature 1)
  const handleSaveConsent = async () => {
    try {
      await api.updateConsent(
        customerPhone,
        p1Consent ? 'granted' : 'denied',
        p2Consent ? 'granted' : 'denied',
        p3Consent ? 'granted' : 'denied'
      );
      const msg = currentLang === 'mr'
        ? 'सहमती लेजरमध्ये सुरक्षित सेव्ह झाली (P1, P2, P3 Recorded).'
        : currentLang === 'hi'
        ? 'सहमति लेजर में सुरक्षित सहेजी गई (P1, P2, P3 Recorded)।'
        : 'Consent preferences recorded to append-only ledger.';
      addToast(msg);
      setQrPortalOpen(false);
    } catch {
      addToast('Error updating consent.');
    }
  };

  // Send OTP for 7-Step Deletion (Feature 2)
  const handleSendOtp = async () => {
    setOtpSending(true);
    try {
      const res = await api.sendOtp(customerPhone);
      setOtpStep('otp_sent');
      setEnteredOtp(res.demoOtp || '2026');
      addToast(res.message);
    } catch {
      addToast('OTP service error.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP & Execute 7-Step Deletion (Feature 2)
  const handleVerifyOtpAndDelete = async () => {
    try {
      const res = await api.verifyOtpDelete(customerPhone, enteredOtp || '2026');
      setP1Consent(false);
      setP2Consent(false);
      setP3Consent(false);
      setDeletionSuccessWorkflow(res.workflow);
      setErasureReceiptHash(res.erasureReceiptHash);
      setOtpStep('verified_deleted');
      const msg = currentLang === 'mr'
        ? '७-टप्पे डेटा नष्ट: तुमचा सर्व खरेदी डेटा कायमस्वरूपी नष्ट केला गेला!'
        : currentLang === 'hi'
        ? '७-चरण डेटा नष्ट: आपका सारा खरीद डेटा हमेशा के लिए मिटा दिया गया!'
        : '7-Step Deletion verified: Consumer data purged from vault!';
      addToast(msg);
    } catch {
      addToast('Invalid OTP or verification failure.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Friendly Neighborhood Kirana Banner - Spacious & Uncongested */}
      <div className="card card-padded" style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
        borderLeft: '4px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="tag tag-privacy" style={{ fontSize: '0.74rem' }}>
                <Lock size={12} />
                <span>{t.storeBadge[currentLang]}</span>
              </span>
              <span className="tag tag-neutral" style={{ fontSize: '0.74rem' }}>
                {t.dpdpNotice[currentLang]}
              </span>
            </div>

            <h1 style={{ fontSize: '1.38rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {t.heroTitle[currentLang]}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55, maxWidth: '680px' }}>
              {t.heroSubtitle[currentLang]}
            </p>
          </div>

          {/* 3-Language Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <Globe size={14} style={{ color: 'var(--text-muted)', marginLeft: '6px' }} />
            <button
              onClick={() => setCurrentLang('mr')}
              className="btn btn-sm"
              style={{
                backgroundColor: currentLang === 'mr' ? 'var(--primary)' : 'transparent',
                color: currentLang === 'mr' ? '#FFFFFF' : 'var(--text-main)',
                padding: '4px 10px',
                fontSize: '0.8rem',
                minHeight: '32px'
              }}
            >
              मराठी
            </button>
            <button
              onClick={() => setCurrentLang('hi')}
              className="btn btn-sm"
              style={{
                backgroundColor: currentLang === 'hi' ? 'var(--primary)' : 'transparent',
                color: currentLang === 'hi' ? '#FFFFFF' : 'var(--text-main)',
                padding: '4px 10px',
                fontSize: '0.8rem',
                minHeight: '32px'
              }}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              className="btn btn-sm"
              style={{
                backgroundColor: currentLang === 'en' ? 'var(--primary)' : 'transparent',
                color: currentLang === 'en' ? '#FFFFFF' : 'var(--text-main)',
                padding: '4px 10px',
                fontSize: '0.8rem',
                minHeight: '32px'
              }}
            >
              English
            </button>
          </div>
        </div>

        {/* Action Buttons row & zero-party preferences preview */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {settings.zeroPartyPreferences.filter(p => p.active).map(pref => (
              <span key={pref.id} className="tag tag-neutral" style={{ fontSize: '0.74rem' }}>
                <Check size={11} style={{ color: '#10B981' }} />
                <span>{pref.label}</span>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setQrPortalOpen(true);
                handleLookupConsent();
              }}
              className="btn btn-outline-gold btn-sm"
              style={{ gap: '6px', minHeight: '38px', padding: '0 14px' }}
            >
              <QrCode size={15} />
              <span>{t.btnPrivacy[currentLang]}</span>
            </button>

            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', minHeight: '38px', padding: '0 14px' }}
            >
              <Sliders size={15} />
              <span>{t.btnPreferences[currentLang]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar - Generous breathing room */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Category Pills */}
        <div className="chips-scroller">
          {[
            { id: 'All', label: t.categories.all[currentLang] },
            { id: 'Groceries', label: t.categories.groceries[currentLang] },
            { id: 'Wellness', label: t.categories.wellness[currentLang] }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-surface)',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.84rem',
                minHeight: '38px',
                padding: '0 16px',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t.searchPlaceholder[currentLang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', fontSize: '0.86rem', minHeight: '40px' }}
          />
        </div>
      </div>

      {/* Product Grid - 16px to 24px gap, not congested */}
      <div className="grid-products">
        {filteredProducts.map(product => {
          const qty = getProductCartQuantity(product.id);

          return (
            <div
              key={product.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Product Image */}
              <div style={{ position: 'relative', height: '190px', backgroundColor: 'var(--bg-surface-subtle)' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
                <span
                  className="tag tag-privacy"
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    backgroundColor: 'rgba(7, 19, 36, 0.88)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '0.7rem',
                    padding: '3px 8px'
                  }}
                >
                  {product.zeroPartyTag}
                </span>
              </div>

              {/* Product Info */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {product.brand}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      ★ {product.rating}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    {product.name}
                  </h3>

                  <p style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    marginBottom: '10px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>

                  {/* Why shown transparency button */}
                  <button
                    onClick={() => setActiveProductDetail(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      color: 'var(--primary)',
                      marginBottom: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <HelpCircle size={12} />
                    <span>{t.whyShown[currentLang]}</span>
                  </button>
                </div>

                {/* Price & In-Card Stepper / Add Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-color)',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹{product.price}
                  </span>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px', minHeight: '38px', padding: '0 14px' }}
                    >
                      <Plus size={14} />
                      <span>{t.addBtn[currentLang]}</span>
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '3px',
                      border: '1px solid var(--primary)'
                    }}>
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="btn btn-sm"
                        style={{ width: 30, height: 30, padding: 0, backgroundColor: 'var(--bg-surface)' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: '0.88rem' }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="btn btn-primary btn-sm"
                        style={{ width: 30, height: 30, padding: 0 }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING CART PILL ON MOBILE: Slides up when items added */}
      {totalCartCount > 0 && (
        <div className="floating-cart-pill" onClick={() => setCartOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} />
            <span>{totalCartCount} {t.floatingBag.itemsSuffix[currentLang]} &bull; ₹{cartTotal}</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.86rem' }}>
            {t.floatingBag.viewBag[currentLang]}
          </span>
        </div>
      )}

      {/* COUNTER QR CODE TRANSPARENCY, CONSENT GATE & OTP DELETION MODAL (Features 1 & 2) */}
      {qrPortalOpen && (
        <div className="modal-backdrop" onClick={() => setQrPortalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {t.counterQRModal.title[currentLang]}
                </h3>
              </div>
              <button onClick={() => setQrPortalOpen(false)} style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Language Switcher for Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={14} />
                <span>{t.counterQRModal.noticeLangLabel[currentLang]}</span>
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['mr', 'hi', 'en'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setCurrentLang(l)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: currentLang === l ? 'var(--primary)' : 'transparent',
                      color: currentLang === l ? '#FFFFFF' : 'var(--text-main)',
                      padding: '2px 8px', fontSize: '0.75rem', minHeight: '28px'
                    }}
                  >
                    {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* Plain Language Consent Notice per DPDP Act Rule 8 */}
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              fontSize: '0.84rem',
              lineHeight: 1.55
            }}>
              {currentLang === 'mr' ? (
                <>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>श्री गणेश किराणा स्टोअर्स — DPDP Act २०२३ सूचना:</p>
                  <p style={{ margin: '0 0 6px 0' }}>१. आम्ही फक्त बिलातील सामानाची बेरीज करून मागणीनुसार सवलती ठरवतो.</p>
                  <p style={{ margin: '0 0 6px 0' }}>२. तुमचा फोन नंबर किंवा नाव कोणत्याही कंपनीला विकले जात नाही.</p>
                  <p style={{ margin: 0 }}>३. तुमचा सर्व डेटा OTP द्वारे पडताळणी करून कायमस्वरूपी नष्ट करण्याचा वैधानिक अधिकार तुम्हाला आहे.</p>
                </>
              ) : currentLang === 'hi' ? (
                <>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>श्री गणेश किराना स्टोर्स — DPDP Act २०२३ सूचना:</p>
                  <p style={{ margin: '0 0 6px 0' }}>१. हम सिर्फ बिल के सामान की गणना करते हैं ताकि आपको सही ऑफर मिल सके।</p>
                  <p style={{ margin: '0 0 6px 0' }}>२. आपका फोन नंबर या नाम किसी भी बाहरी कंपनी को नहीं बेचा जाता।</p>
                  <p style={{ margin: 0 }}>३. अपना सारा डेटा OTP सत्यापन के जरिए १-क्लिक में मिटाने का पूरा कानूनी अधिकार आपका है।</p>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Shree Ganesh Kirana — DPDP Act 2023 Statutory Notice:</p>
                  <p style={{ margin: '0 0 6px 0' }}>1. We only aggregate grocery basket items to arrange neighborhood discounts.</p>
                  <p style={{ margin: '0 0 6px 0' }}>2. Your mobile number and personal identity are never sold or profiled.</p>
                  <p style={{ margin: 0 }}>3. Under Section 8(7), you possess the statutory right to verify via OTP and permanently erase all your data anytime.</p>
                </>
              )}
            </div>

            {/* Phone Lookup for demonstration */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                {t.counterQRModal.phoneLabel[currentLang]}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.86rem', flex: 1 }}
                />
                <button onClick={handleLookupConsent} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', minHeight: '38px' }}>
                  {t.counterQRModal.checkBtn[currentLang]}
                </button>
              </div>
              {phoneHashResult && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Keyed HMAC-SHA256 Hash: <code style={{ fontFamily: 'var(--font-mono)' }}>{phoneHashResult.substring(0, 24)}...</code>
                </div>
              )}
            </div>

            {/* FEATURE 1: Distinct Captures (P1, P2, P3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{t.counterQRModal.p1Title[currentLang]}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {t.counterQRModal.p1Sub[currentLang]}
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={p1Consent}
                    onChange={(e) => setP1Consent(e.target.checked)}
                  />
                  <span className="toggle-track"></span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{t.counterQRModal.p2Title[currentLang]}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {t.counterQRModal.p2Sub[currentLang]}
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={p2Consent && p1Consent}
                    disabled={!p1Consent}
                    onChange={(e) => setP2Consent(e.target.checked)}
                  />
                  <span className="toggle-track"></span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{t.counterQRModal.p3Title[currentLang]}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {t.counterQRModal.p3Sub[currentLang]}
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={p3Consent && p1Consent}
                    disabled={!p1Consent}
                    onChange={(e) => setP3Consent(e.target.checked)}
                  />
                  <span className="toggle-track"></span>
                </label>
              </div>
            </div>

            {/* FEATURE 2: 2-Step OTP Verification for Data Erasure */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <KeyRound size={16} style={{ color: '#EF4444' }} />
                <strong style={{ fontSize: '0.88rem', color: '#EF4444' }}>
                  {currentLang === 'mr' ? 'OTP पडताळणीद्वारे ७-टप्पे डेटा नष्ट करा (DPDP Sec 8(7))' : currentLang === 'hi' ? 'OTP सत्यापन द्वारा ७-चरण डेटा मिटाएं (DPDP Sec 8(7))' : 'Customer-Facing OTP Erasure Workflow (DPDP Sec 8(7))'}
                </strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                {currentLang === 'mr' 
                  ? 'सुरक्षिततेसाठी तुमच्या फोनवर ४-अंकी OTP पाठवला जाईल. OTP टाकल्यानंतर T2 डेटाबेस कायमचा नष्ट केला जाईल.' 
                  : 'A 4-digit OTP will be dispatched to verify your identity before stored purchase rows are permanently purged.'}
              </p>

              {otpStep === 'initial' && (
                <button
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#EF4444', borderColor: '#EF4444', gap: '6px', minHeight: '38px' }}
                >
                  <Trash2 size={14} />
                  <span>{currentLang === 'mr' ? 'OTP पाठवा व डेटा नष्ट करा' : 'Request OTP & Initiate Erasure'}</span>
                </button>
              )}

              {otpStep === 'otp_sent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="Enter 4-digit OTP"
                      className="form-input"
                      style={{ maxWidth: '160px', textAlign: 'center', fontWeight: 700, letterSpacing: '4px', fontSize: '1rem' }}
                    />
                    <button
                      onClick={handleVerifyOtpAndDelete}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#EF4444', color: '#FFFFFF', minHeight: '38px', gap: '6px' }}
                    >
                      <Check size={14} />
                      <span>{currentLang === 'mr' ? 'OTP तपासा व नष्ट करा' : 'Verify OTP & Purge'}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Demo OTP generated: <strong>2026</strong> (dispatched to {customerPhone})
                  </div>
                </div>
              )}

              {otpStep === 'verified_deleted' && deletionSuccessWorkflow && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                    <ShieldCheck size={16} />
                    <span>७-टप्पे डेटा डिलीट खात्री (Cryptographically Committed):</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                    {deletionSuccessWorkflow.map((step, idx) => (
                      <li key={idx} style={{ marginBottom: '2px' }}>{step}</li>
                    ))}
                  </ul>
                  {erasureReceiptHash && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Receipt Hash: <code style={{ fontFamily: 'var(--font-mono)' }}>{erasureReceiptHash}</code>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)', gap: '10px' }}>
              <button
                onClick={handleSaveConsent}
                className="btn btn-primary btn-sm"
                style={{ minHeight: '40px', padding: '0 18px' }}
              >
                {t.counterQRModal.saveConsentBtn[currentLang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Preferences Drawer */}
      {privacyModalOpen && (
        <div className="modal-backdrop" onClick={() => setPrivacyModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {t.preferencesVault.title[currentLang]}
                </h3>
              </div>
              <button onClick={() => setPrivacyModalOpen(false)} style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {t.preferencesVault.subtitle[currentLang]}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {settings.zeroPartyPreferences.map(pref => (
                <div
                  key={pref.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{pref.label}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.preferencesVault.categoryLabel[currentLang]} {pref.category}</div>
                  </div>

                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={pref.active}
                      onChange={() => toggleZeroPartyPref(pref.id)}
                    />
                    <span className="toggle-track"></span>
                  </label>
                </div>
              ))}
            </div>

            {/* Incognito mode */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <EyeOff size={18} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{t.preferencesVault.incognitoTitle[currentLang]}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {t.preferencesVault.incognitoSub[currentLang]}
                  </div>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.incognitoMode}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, incognitoMode: e.target.checked }));
                    const msg = currentLang === 'mr'
                      ? `गुप्त मोड ${e.target.checked ? 'चालू' : 'बंद'}`
                      : currentLang === 'hi'
                      ? `गुप्त मोड ${e.target.checked ? 'चालू' : 'बंद'}`
                      : `Incognito Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`;
                    addToast(msg);
                  }}
                />
                <span className="toggle-track"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button onClick={() => setPrivacyModalOpen(false)} className="btn btn-primary btn-sm" style={{ minHeight: '40px', padding: '0 20px' }}>
                {t.preferencesVault.doneBtn[currentLang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Transparency Modal */}
      {activeProductDetail && (
        <div className="modal-backdrop" onClick={() => setActiveProductDetail(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className="tag tag-privacy" style={{ marginBottom: '6px' }}>
                  {currentLang === 'mr' ? 'जबाबदार वैयक्तिकरण' : currentLang === 'hi' ? 'जिम्मेदार वैयक्तिकरण' : 'Responsible Personalisation'}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {activeProductDetail.name}
                </h3>
              </div>
              <button onClick={() => setActiveProductDetail(null)} style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {t.whyShown[currentLang]}:
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {activeProductDetail.privacyMatchReason}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Zero third-party trackers or cross-site profiling involved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Zero inferential profiling (no religion, health, or caste guessing)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Differential Privacy bounded: Noise factor calibrated to groups of 10+</span>
              </div>
            </div>

            <button onClick={() => setActiveProductDetail(null)} className="btn btn-primary" style={{ width: '100%', minHeight: '42px' }}>
              {currentLang === 'mr' ? 'समजले (Understood)' : currentLang === 'hi' ? 'समझ गया (Understood)' : 'Understood'}
            </button>
          </div>
        </div>
      )}

      {/* Shopping Bag Drawer / Modal */}
      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {t.bagDrawer.title[currentLang]} ({cart.length})
                </h3>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {t.bagDrawer.empty[currentLang]}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      gap: '12px'
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ₹{item.product.price} {t.bagDrawer.each[currentLang]}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: 30, height: 30, padding: 0 }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: 30, height: 30, padding: 0 }}
                      >
                        +
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.product.id)} style={{ color: '#EF4444', padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.bagDrawer.subtotal[currentLang]}</span>
                    <span style={{ fontWeight: 600 }}>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t.bagDrawer.delivery[currentLang]}</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>{t.bagDrawer.freeDelivery[currentLang]}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                    <span>{t.bagDrawer.total[currentLang]}</span>
                    <span style={{ color: 'var(--primary)' }}>₹{cartTotal}</span>
                  </div>
                </div>

                {/* 2 Easy Checkout Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleWhatsAppOrder}
                    className="btn btn-whatsapp"
                    style={{ width: '100%', padding: '14px', minHeight: '46px', gap: '8px', fontSize: '0.94rem' }}
                  >
                    <MessageCircle size={18} />
                    <span>{t.bagDrawer.orderWhatsApp[currentLang]} (₹{cartTotal})</span>
                  </button>

                  <button
                    onClick={handleCheckout}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', minHeight: '46px', fontSize: '0.94rem' }}
                  >
                    {t.bagDrawer.confirmPrivate[currentLang]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Complete Receipt Modal */}
      {checkoutCompleteOrder && (
        <div className="modal-backdrop" onClick={() => setCheckoutCompleteOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-drag-handle" />

            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto'
              }}>
                <Check size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                {t.receiptModal.title[currentLang]}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {t.receiptModal.orderNo[currentLang]} {checkoutCompleteOrder.id} &bull; {checkoutCompleteOrder.date}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.receiptModal.totalAmount[currentLang]}</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>₹{checkoutCompleteOrder.total}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.receiptModal.tokenLabel[currentLang]}</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{checkoutCompleteOrder.anonymizedToken}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{t.receiptModal.attachedConsent[currentLang]}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {checkoutCompleteOrder.zeroPartyDataAttached.map(t => (
                    <span key={t} className="tag tag-neutral" style={{ fontSize: '0.74rem' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setCheckoutCompleteOrder(null)} className="btn btn-primary" style={{ width: '100%', minHeight: '44px' }}>
              {t.receiptModal.doneBtn[currentLang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
