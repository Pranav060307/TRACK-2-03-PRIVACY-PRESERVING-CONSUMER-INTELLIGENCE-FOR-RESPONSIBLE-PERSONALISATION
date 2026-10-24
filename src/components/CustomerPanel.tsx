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
  ShieldCheck
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
  addToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [checkoutCompleteOrder, setCheckoutCompleteOrder] = useState<Order | null>(null);

  // Consent & Transparency QR Portal State
  const [qrPortalOpen, setQrPortalOpen] = useState(false);
  const [noticeLang, setNoticeLang] = useState<'mr' | 'hi' | 'en'>('mr');
  const [customerPhone, setCustomerPhone] = useState('+91-0010000001');
  const [consentLookupLoading, setConsentLookupLoading] = useState(false);
  const [p1Consent, setP1Consent] = useState(true);
  const [p2Consent, setP2Consent] = useState(false);
  const [p3Consent, setP3Consent] = useState(false);
  const [phoneHashResult, setPhoneHashResult] = useState('');
  const [deletionSuccessWorkflow, setDeletionSuccessWorkflow] = useState<string[] | null>(null);

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const toggleZeroPartyPref = (prefId: string) => {
    setSettings(prev => ({
      ...prev,
      zeroPartyPreferences: prev.zeroPartyPreferences.map(p => 
        p.id === prefId ? { ...p, active: !p.active } : p
      )
    }));
    addToast('Zero-party preference updated locally in browser enclave.');
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
    addToast(`Order ${newOrder.id} placed! Privacy receipt generated.`);
  };

  // QR Consent Lookup
  const handleLookupConsent = async () => {
    setConsentLookupLoading(true);
    try {
      const res = await api.lookupConsent(customerPhone);
      setPhoneHashResult(res.phoneHash);
      setP1Consent(res.p1Analytics === 'granted');
      setP2Consent(res.p2WhatsApp === 'granted');
      setP3Consent(res.p3SMS === 'granted');
      setDeletionSuccessWorkflow(null);
      addToast('Customer record located via secret HMAC-SHA256 key vault.');
    } catch {
      addToast('Error fetching consent state from backend.');
    } finally {
      setConsentLookupLoading(false);
    }
  };

  // Save Consent to append-only ledger
  const handleSaveConsent = async () => {
    try {
      await api.updateConsent(
        customerPhone,
        p1Consent ? 'granted' : 'denied',
        p2Consent ? 'granted' : 'denied',
        p3Consent ? 'granted' : 'denied'
      );
      addToast('Consent event recorded in immutable append-only ledger.');
    } catch {
      addToast('Error updating consent in backend.');
    }
  };

  // 7-Step Deletion Execution
  const handleExecuteDeletion = async () => {
    if (!window.confirm('Confirm 7-Step Data Erasure: All your T2 purchase rows will be purged immediately.')) return;

    try {
      const res = await api.requestDeletion(customerPhone);
      setP1Consent(false);
      setP2Consent(false);
      setP3Consent(false);
      setDeletionSuccessWorkflow(res.workflow);
      addToast('7-Step Deletion Workflow completed! Customer data erased.');
    } catch {
      addToast('Deletion error.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Privacy Notice & QR Code Banner */}
      <div className="card card-padded" style={{
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '4px solid var(--primary)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '740px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="tag tag-privacy">
              <Lock size={12} />
              CohortLens Customer Protection
            </span>
            <span className="tag tag-neutral">
              DPDP Act 2023 Compliant Notice
            </span>
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Your Neighborhood Kirana &bull; Zero Profiling Guarantee
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            We only read what is printed on your billing receipt to detect group demand. 
            We <strong>never track your phone location</strong>, <strong>never build a personal profile</strong>, 
            and <strong>never sell your data to quick-commerce apps or lenders</strong>.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {settings.zeroPartyPreferences.filter(p => p.active).map(pref => (
              <span key={pref.id} className="tag tag-neutral" style={{ fontSize: '0.72rem' }}>
                <Check size={11} style={{ color: '#10B981' }} />
                <span>{pref.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setQrPortalOpen(true);
              handleLookupConsent();
            }}
            className="btn btn-outline-gold btn-sm"
            style={{ gap: '6px' }}
          >
            <QrCode size={14} />
            <span>Counter QR Transparency Portal</span>
          </button>

          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <Sliders size={14} />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['All', 'Groceries', 'Wellness'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search kirana staples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid-products">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Image */}
            <div style={{ position: 'relative', height: '220px', backgroundColor: 'var(--bg-surface-subtle)' }}>
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
                  backgroundColor: 'rgba(7, 19, 36, 0.85)',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {product.zeroPartyTag}
              </span>
            </div>

            {/* Info */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {product.brand}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    ★ {product.rating} <span style={{ color: 'var(--text-muted)' }}>({product.reviewsCount})</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px 0', lineHeight: 1.35 }}>
                  {product.name}
                </h3>

                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  marginBottom: '12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.description}
                </p>

                {/* Privacy transparency explanation */}
                <button
                  onClick={() => setActiveProductDetail(product)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    color: 'var(--primary)',
                    marginBottom: '14px',
                    textAlign: 'left'
                  }}
                >
                  <HelpCircle size={12} />
                  <span>Why this matches your privacy preferences</span>
                </button>
              </div>

              {/* Price & Action in INR */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ₹{product.price}
                </span>

                <button
                  onClick={() => addToCart(product)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <ShoppingBag size={14} />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COUNTER QR CODE TRANSPARENCY & DELETION PORTAL MODAL */}
      {qrPortalOpen && (
        <div className="modal-backdrop" onClick={() => setQrPortalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Counter QR Consent &amp; Transparency Portal
                </h3>
              </div>
              <button onClick={() => setQrPortalOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Language Switcher for Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '14px'
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={14} />
                <span>Notice Language (DPDP Rule 8):</span>
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setNoticeLang('mr')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: noticeLang === 'mr' ? 'var(--primary)' : 'transparent',
                    color: noticeLang === 'mr' ? '#FFFFFF' : 'var(--text-main)',
                    padding: '2px 8px', fontSize: '0.75rem'
                  }}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setNoticeLang('hi')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: noticeLang === 'hi' ? 'var(--primary)' : 'transparent',
                    color: noticeLang === 'hi' ? '#FFFFFF' : 'var(--text-main)',
                    padding: '2px 8px', fontSize: '0.75rem'
                  }}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setNoticeLang('en')}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: noticeLang === 'en' ? 'var(--primary)' : 'transparent',
                    color: noticeLang === 'en' ? '#FFFFFF' : 'var(--text-main)',
                    padding: '2px 8px', fontSize: '0.75rem'
                  }}
                >
                  English
                </button>
              </div>
            </div>

            {/* Plain Language Consent Notice per DPDP Act */}
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              fontSize: '0.82rem',
              lineHeight: 1.5
            }}>
              {noticeLang === 'mr' && (
                <div>
                  <strong>किराणा गोपनीयता सूचना:</strong> आम्ही फक्त तुमच्या बिलामधील आवश्यक माहिती (आठवडा, खरेदी श्रेणी, रक्कम वर्ग) साठवतो. तुमचे नाव, वय किंवा पत्ता कधीही साठवला जात नाही. तुम्ही कधीही तुमची माहिती पाहू आणि हटवू शकता.
                </div>
              )}
              {noticeLang === 'hi' && (
                <div>
                  <strong>किराना गोपनीयता सूचना:</strong> हम केवल आपके बिल से आवश्यक जानकारी (सप्ताह, खरीद श्रेणी, राशि वर्ग) एकत्र करते हैं। आपका नाम, उम्र या पता कभी दर्ज नहीं किया जाता। आप कभी भी अपना डेटा देख और मिटा सकते हैं।
                </div>
              )}
              {noticeLang === 'en' && (
                <div>
                  <strong>Kirana Privacy Notice:</strong> We only retain 4 minimised fields from your receipt: week, general category, and amount band. Your name, age, gender, and address are never collected. You can view or erase your record anytime.
                </div>
              )}
            </div>

            {/* Phone Lookup & Cryptographic Verification */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91-0010000001"
                className="form-input"
                style={{ fontSize: '0.84rem' }}
              />
              <button
                onClick={handleLookupConsent}
                disabled={consentLookupLoading}
                className="btn btn-secondary btn-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                {consentLookupLoading ? 'Locating...' : 'Verify Record'}
              </button>
            </div>

            {phoneHashResult && (
              <div style={{
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginBottom: '12px'
              }}>
                HMAC-SHA256 Vault ID: <span style={{ color: 'var(--primary)' }}>{phoneHashResult}</span> (Phone never stored in plaintext)
              </div>
            )}

            {/* The 3 Consent Choices (P1, P2, P3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>P1: Cohort Analytics Consent</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Allow purchases to be linked by pseudonymous hash in 10+ groups
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
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>P2: WhatsApp Group Offers</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Receive occasional staples discounts on WhatsApp (requires P1)
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
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>P3: SMS Group Offers</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Receive occasional neighborhood discount SMS
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

            {/* Deletion Workflow Display */}
            {deletionSuccessWorkflow && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: '14px',
                fontSize: '0.78rem'
              }}>
                <div style={{ fontWeight: 700, color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>7-Step Deletion Proof Verified (DPDP Act Sec 8(7)):</span>
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-secondary)' }}>
                  {deletionSuccessWorkflow.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={handleExecuteDeletion}
                className="btn btn-secondary btn-sm"
                style={{ color: '#EF4444', borderColor: '#EF4444', gap: '4px' }}
              >
                <Trash2 size={13} />
                <span>1-Click Erase All My Data</span>
              </button>

              <button
                onClick={() => {
                  handleSaveConsent();
                  setQrPortalOpen(false);
                }}
                className="btn btn-primary btn-sm"
              >
                Save Preferences to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Preferences Drawer */}
      {privacyModalOpen && (
        <div className="modal-backdrop" onClick={() => setPrivacyModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Customer Privacy Vault
                </h3>
              </div>
              <button onClick={() => setPrivacyModalOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You control what grocery categories and budget brackets our algorithm prioritizes locally.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Stated Intent Preferences
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {settings.zeroPartyPreferences.map(pref => (
                  <div
                    key={pref.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{pref.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Category: {pref.category}</div>
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
            </div>

            {/* Differential Privacy Slider */}
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Differential Privacy Epsilon (&epsilon;):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                  {settings.epsilon}
                </span>
              </div>

              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                value={settings.epsilon}
                onChange={(e) => {
                  const eps = parseFloat(e.target.value);
                  setSettings(prev => ({ ...prev, epsilon: eps }));
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>&epsilon;=0.2 (Maximum Anonymity)</span>
                <span>&epsilon;=0.5 (Balanced)</span>
                <span>&epsilon;=1.0 (High Precision)</span>
              </div>
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
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <EyeOff size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>Incognito Shopping Mode</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Wipes session tokens immediately upon browser tab close
                  </div>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.incognitoMode}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, incognitoMode: e.target.checked }));
                    addToast(`Incognito Shopping ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                />
                <span className="toggle-track"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button onClick={() => setPrivacyModalOpen(false)} className="btn btn-primary btn-sm">
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Transparency Modal */}
      {activeProductDetail && (
        <div className="modal-backdrop" onClick={() => setActiveProductDetail(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className="tag tag-privacy" style={{ marginBottom: '6px' }}>
                  Responsible Personalisation Transparency
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  {activeProductDetail.name}
                </h3>
              </div>
              <button onClick={() => setActiveProductDetail(null)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Why you were shown this item:
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {activeProductDetail.privacyMatchReason}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} style={{ color: '#10B981' }} />
                <span>Zero third-party trackers or cross-site cookies involved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} style={{ color: '#10B981' }} />
                <span>Zero inferential profiling (no religion, health, or caste guessing)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} style={{ color: '#10B981' }} />
                <span>Differential Privacy bounded: Noise factor calibrated to &epsilon;={settings.epsilon}</span>
              </div>
            </div>

            <button onClick={() => setActiveProductDetail(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Shopping Bag Drawer / Modal */}
      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Grocery Bag ({cart.length})
                </h3>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Your grocery bag is empty.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      gap: '12px'
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ₹{item.product.price} each
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: 26, height: 26, padding: 0 }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: 26, height: 26, padding: 0 }}
                      >
                        +
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.product.id)} style={{ color: '#EF4444', padding: '4px' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <div style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Neighborhood Delivery:</span>
                    <span style={{ color: '#10B981', fontWeight: 500 }}>Free Doorstep Kirana Delivery</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                    <span>Total:</span>
                    <span style={{ color: 'var(--primary)' }}>₹{cartTotal}</span>
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Confirm &amp; Checkout Privately (₹{cartTotal})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Complete Receipt Modal */}
      {checkoutCompleteOrder && (
        <div className="modal-backdrop" onClick={() => setCheckoutCompleteOrder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
                margin: '0 auto 8px auto'
              }}>
                <Check size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                Kirana Bill Issued &bull; Privacy Protected
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Order ID: {checkoutCompleteOrder.id} &bull; {checkoutCompleteOrder.date}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>₹{checkoutCompleteOrder.total}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Anonymized Token:</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{checkoutCompleteOrder.anonymizedToken}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stated Zero-Party Intent Attached:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {checkoutCompleteOrder.zeroPartyDataAttached.map(t => (
                    <span key={t} className="tag tag-neutral" style={{ fontSize: '0.7rem' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setCheckoutCompleteOrder(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Done &amp; Return to Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
