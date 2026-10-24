import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerPanel } from './components/CustomerPanel';
import { ShopOwnerPanel } from './components/ShopOwnerPanel';
import type { 
  AppPanel, 
  ThemeMode, 
  Product, 
  CartItem, 
  CustomerPrivacySettings, 
  Order, 
  StoreCohort, 
  MerchantKPIs 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMER_SETTINGS, 
  INITIAL_STORE_COHORTS, 
  INITIAL_MERCHANT_KPIS 
} from './data/storeData';
import { 
  Store, 
  ShoppingBag, 
  ShieldCheck, 
  UserCheck, 
  Lock 
} from 'lucide-react';

export const App: React.FC = () => {
  // Panel switcher: customer vs shop-owner
  const [currentPanel, setCurrentPanel] = useState<AppPanel>('customer');
  // Default to clean Light Theme (editorial/warm cream) or Dark Theme (deep navy)
  const [theme, setTheme] = useState<ThemeMode>('light');
  // 3 Languages: Marathi ('mr'), Hindi ('hi'), English ('en')
  const [lang, setLang] = useState<'mr' | 'hi' | 'en'>('mr');

  // Products and Customer State
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customerSettings, setCustomerSettings] = useState<CustomerPrivacySettings>(INITIAL_CUSTOMER_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);

  // Store Owner State
  const [kpis, setKpis] = useState<MerchantKPIs>(INITIAL_MERCHANT_KPIS);
  const [cohorts] = useState<StoreCohort[]>(INITIAL_STORE_COHORTS);

  // Minimal toast notifications
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const addToast = (message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Sync theme attribute to <html> tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    const msg = lang === 'mr' 
      ? `"${product.name}" पिशवीत जोडले.`
      : lang === 'hi'
      ? `"${product.name}" थैले में जोड़ा गया।`
      : `Added "${product.name}" to bag.`;
    addToast(msg);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleCheckoutOrder = (order: Order) => {
    setKpis(prev => ({
      ...prev,
      totalOrders: prev.totalOrders + 1,
      totalRevenue: prev.totalRevenue + order.total
    }));
    setCart([]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Mobile bar labels in 3 languages
  const navLabels = {
    store: {
      mr: 'दुकान (Store)',
      hi: 'दुकान (Store)',
      en: 'Store'
    },
    bag: {
      mr: 'पिशवी (Bag)',
      hi: 'थैला (Bag)',
      en: 'Bag'
    },
    privacy: {
      mr: 'गोपनीयता',
      hi: 'गोपनीयता',
      en: 'Privacy'
    },
    ownerSwitch: {
      mr: currentPanel === 'customer' ? 'दुकानदार' : 'ग्राहक मोड',
      hi: currentPanel === 'customer' ? 'दुकानदार' : 'ग्राहक मोड',
      en: currentPanel === 'customer' ? 'Owner Portal' : 'Store View'
    }
  };

  return (
    <div className="app-container">
      {/* Minimal Top Navigation with 3-language selector */}
      <Navbar
        currentPanel={currentPanel}
        setCurrentPanel={setCurrentPanel}
        theme={theme}
        setTheme={setTheme}
        cartCount={cartItemCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Panel Content */}
      <main className="main-content">
        {currentPanel === 'customer' ? (
          <CustomerPanel
            products={products}
            settings={customerSettings}
            setSettings={setCustomerSettings}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
            privacyModalOpen={privacyModalOpen}
            setPrivacyModalOpen={setPrivacyModalOpen}
            onCheckout={handleCheckoutOrder}
            addToast={addToast}
            lang={lang}
            setLang={setLang}
          />
        ) : (
          <ShopOwnerPanel
            kpis={kpis}
            cohorts={cohorts}
            products={products}
            addToast={addToast}
            lang={lang}
            setLang={setLang}
          />
        )}
      </main>

      {/* NATIVE MOBILE BOTTOM BAR FOR PHONES (44px-64px ergonomic touch bar) */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          onClick={() => setCurrentPanel('customer')}
          className={`nav-item-btn ${currentPanel === 'customer' ? 'active' : ''}`}
        >
          <Store size={20} />
          <span>{navLabels.store[lang]}</span>
        </button>

        <button
          onClick={() => setCartOpen(true)}
          className="nav-item-btn"
          style={{ position: 'relative' }}
        >
          <ShoppingBag size={20} />
          <span>{navLabels.bag[lang]}</span>
          {cartItemCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 6,
              right: '25%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '1px 5px',
              fontSize: '0.65rem',
              fontWeight: 800
            }}>
              {cartItemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setPrivacyModalOpen(true)}
          className="nav-item-btn"
        >
          <ShieldCheck size={20} />
          <span>{navLabels.privacy[lang]}</span>
        </button>

        <button
          onClick={() => setCurrentPanel(currentPanel === 'customer' ? 'shop-owner' : 'customer')}
          className={`nav-item-btn ${currentPanel === 'shop-owner' ? 'active' : ''}`}
        >
          <UserCheck size={20} />
          <span>{navLabels.ownerSwitch[lang]}</span>
        </button>
      </nav>

      {/* Minimal Real Retail Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '20px 16px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
              {lang === 'mr' ? 'श्री गणेश किराणा • CohortLens खाजगी सुरक्षा' : lang === 'hi' ? 'श्री गणेश किराना • CohortLens निजी सुरक्षा' : 'Shree Ganesh Kirana • CohortLens Privacy-Preserving Engine'}
            </div>
            <div>
              DPDP Act 2023 &amp; CCPA Compliant. No individual tracking, no cross-site cookies, 1-click erasure.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} />
              <span>Decentralized Enclave</span>
            </span>
            <span>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} style={{ color: '#10B981' }} />
              <span>Section 8(7) DPDP Ready</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Toast notifications */}
      <div className="toast-box">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-item">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
