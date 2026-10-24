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
import { Lock, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Panel switcher: customer vs shop-owner
  const [currentPanel, setCurrentPanel] = useState<AppPanel>('customer');
  // Default to clean Light Theme (editorial/warm cream) or Dark Theme (deep navy)
  const [theme, setTheme] = useState<ThemeMode>('light');

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
    addToast(`Added "${product.name}" to cart.`);
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

  return (
    <div className="app-container">
      {/* Minimal Top Navigation */}
      <Navbar
        currentPanel={currentPanel}
        setCurrentPanel={setCurrentPanel}
        theme={theme}
        setTheme={setTheme}
        cartCount={cartItemCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
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
          />
        ) : (
          <ShopOwnerPanel
            kpis={kpis}
            cohorts={cohorts}
            products={products}
            addToast={addToast}
          />
        )}
      </main>

      {/* Minimal Real Retail Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '24px 16px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
              &AElig;GIS Retail Intelligence &bull; Privacy-Preserving Personalisation
            </div>
            <div>
              Built with Differential Privacy and Zero-Party Data. No cross-site profiling or cookie tracking.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} />
              <span>Decentralized Enclave</span>
            </span>
            <span>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} style={{ color: '#10B981' }} />
              <span>GDPR Art. 25 &amp; CCPA</span>
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
