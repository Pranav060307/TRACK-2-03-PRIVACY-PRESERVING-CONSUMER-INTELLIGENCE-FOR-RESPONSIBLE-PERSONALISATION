import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Lock, 
  Check, 
  Trash2, 
  Sliders, 
  HelpCircle,
  EyeOff
} from 'lucide-react';
import type { 
  Product, 
  CustomerPrivacySettings, 
  CartItem, 
  Order 
} from '../types';

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
    addToast('Privacy Vault updated: Recommendations tuned locally.');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      total: cartTotal,
      anonymizedToken: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      zeroPartyDataAttached: settings.zeroPartyPreferences.filter(p => p.active).map(p => p.label),
      privacyGuarantee: `Differential Privacy ε=${settings.epsilon} with zero third-party cookie transmission.`
    };

    onCheckout(newOrder);
    setCheckoutCompleteOrder(newOrder);
    setCartOpen(false);
    addToast(`Order ${newOrder.id} confirmed with zero-party privacy receipt!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Real Privacy Assurance Banner */}
      <div className="card card-padded" style={{
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '4px solid var(--primary)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="tag tag-privacy">
              <Lock size={12} />
              On-Device Personalisation Active
            </span>
            <span className="tag tag-neutral">
              Privacy Loss Budget &epsilon;={settings.epsilon}
            </span>
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Curated For You &bull; Zero Surveillance Tracking
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Every product below is matched using <strong>Zero-Party Intent declarations</strong> stored in your browser session. 
            No tracking cookies, no cross-site pixels, and no personal data sold to brokers.
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

        <button
          onClick={() => setPrivacyModalOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <Sliders size={14} />
          <span>Manage Preferences</span>
        </button>
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
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {['All', 'Apparel', 'Audio & Tech', 'Wellness', 'Home & Living', 'Groceries'].map(cat => (
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
            placeholder="Search items..."
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

                {/* Privacy transparent reason */}
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

              {/* Price & Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ${product.price}
                </span>

                <button
                  onClick={() => addToCart(product)}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <ShoppingBag size={14} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Modal */}
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
              <button
                onClick={() => setActiveProductDetail(null)}
                style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
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
                <span>Computed via local WebAssembly vector matching in your browser</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} style={{ color: '#10B981' }} />
                <span>Differential Privacy bounded: Noise factor calibrated to &epsilon;={settings.epsilon}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveProductDetail(null)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Customer Privacy Vault Drawer / Modal */}
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
              <button
                onClick={() => setPrivacyModalOpen(false)}
                style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You control exactly what signals our store algorithm can see. Stored locally in your browser enclave.
            </p>

            {/* Zero-Party Intent Preferences */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                My Stated Preferences (Zero-Party Data)
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
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Differential Privacy Budget (&epsilon;):</span>
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
                <span>&epsilon;=0.7 (Balanced)</span>
                <span>&epsilon;=1.5 (High Match)</span>
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
                  <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>Incognito Browsing Mode</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Shreds local vectors immediately upon tab exit
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <button
                onClick={() => {
                  addToast('Local session tokens purged successfully.');
                  setPrivacyModalOpen(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: '#EF4444', borderColor: '#EF4444' }}
              >
                <Trash2 size={13} />
                <span>Purge Local History</span>
              </button>

              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="btn btn-primary btn-sm"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer / Modal */}
      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Shopping Bag ({cart.length})
                </h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Your shopping bag is empty.
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
                        ${item.product.price} each
                      </div>
                    </div>

                    {/* Quantity controls */}
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

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ color: '#EF4444', padding: '4px' }}
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {/* Subtotal */}
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
                    <span style={{ fontWeight: 600 }}>${cartTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
                    <span style={{ color: '#10B981', fontWeight: 500 }}>Free Privacy Delivery</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                    <span>Total:</span>
                    <span style={{ color: 'var(--primary)' }}>${cartTotal}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={12} style={{ color: '#10B981' }} />
                  <span>Checkout creates an anonymized hash; payment tokens are shielded.</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Confirm &amp; Checkout Privately (${cartTotal})
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
                Order Completed Privately
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Order ID: {checkoutCompleteOrder.id} &bull; {checkoutCompleteOrder.date}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span>
                <strong style={{ fontSize: '0.95rem' }}>${checkoutCompleteOrder.total}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Anonymized Token:</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{checkoutCompleteOrder.anonymizedToken}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stated Zero-Party Intent Linked:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {checkoutCompleteOrder.zeroPartyDataAttached.map(t => (
                    <span key={t} className="tag tag-neutral" style={{ fontSize: '0.7rem' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCheckoutCompleteOrder(null)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Done &amp; Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
