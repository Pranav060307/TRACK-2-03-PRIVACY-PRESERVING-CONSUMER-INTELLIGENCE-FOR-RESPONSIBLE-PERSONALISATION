import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Store, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Lock,
  Globe
} from 'lucide-react';
import type { AppPanel, ThemeMode } from '../types';

interface NavbarProps {
  currentPanel: AppPanel;
  setCurrentPanel: (panel: AppPanel) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenPrivacyModal: () => void;
  lang?: 'mr' | 'hi' | 'en';
  setLang?: (lang: 'mr' | 'hi' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPanel,
  setCurrentPanel,
  theme,
  setTheme,
  cartCount,
  onOpenCart,
  onOpenPrivacyModal,
  lang = 'mr',
  setLang
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = {
    topBarPrivacy: {
      mr: 'झिरो-ट्रॅकिंग कुकीज • DPDP Act २०२३ खाजगी सुरक्षा',
      hi: 'शून्य ट्रैकिंग कुकीज • DPDP Act २०२३ निजी सुरक्षा',
      en: 'Zero third-party tracking cookies • DPDP Act 2023 Compliant'
    },
    privacyVault: {
      mr: 'माझी गोपनीयता (Vault)',
      hi: 'मेरी गोपनीयता (Vault)',
      en: 'Privacy Vault'
    },
    brandTitle: {
      mr: 'श्री गणेश किराणा',
      hi: 'श्री गणेश किराना',
      en: 'ÆGIS &bull; Ganesh Kirana'
    },
    brandSub: {
      mr: 'CohortLens जबाबदार वैयक्तिकरण',
      hi: 'CohortLens जिम्मेदार वैयक्तिकरण',
      en: 'CohortLens Privacy Personalisation'
    },
    customerTab: {
      mr: 'ग्राहक दुकान',
      hi: 'ग्राहक दुकान',
      en: 'Customer Store'
    },
    ownerTab: {
      mr: 'दुकानदार पोर्टल',
      hi: 'दुकानदार पोर्टल',
      en: 'Shop Owner'
    },
    cartLabel: {
      mr: 'पिशवी',
      hi: 'थैला',
      en: 'Cart'
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      transition: 'background-color var(--transition-fast)'
    }}>
      {/* Top minimal status bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface-subtle)',
        borderBottom: '1px solid var(--border-color)',
        padding: '4px 16px',
        fontSize: '0.74rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#10B981'
          }} />
          <span>{t.topBarPrivacy[lang]}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {setLang && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Globe size={11} style={{ marginRight: '2px', color: 'var(--text-muted)' }} />
              {(['mr', 'hi', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 5px',
                    fontWeight: lang === l ? 700 : 400,
                    color: lang === l ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: lang === l ? 'rgba(29, 78, 216, 0.08)' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'EN'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onOpenPrivacyModal}
            style={{
              color: 'var(--primary)',
              fontWeight: 500,
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Lock size={12} />
            <span>{t.privacyVault[lang]}</span>
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            &AElig;
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              {t.brandTitle[lang]}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {t.brandSub[lang]}
            </div>
          </div>
        </div>

        {/* Panel Switcher - Desktop */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }} className="desktop-panels">
          <button
            onClick={() => setCurrentPanel('customer')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentPanel === 'customer' ? 'var(--primary)' : 'transparent',
              color: currentPanel === 'customer' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <User size={14} />
            <span>{t.customerTab[lang]}</span>
          </button>

          <button
            onClick={() => setCurrentPanel('shop-owner')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentPanel === 'shop-owner' ? 'var(--primary)' : 'transparent',
              color: currentPanel === 'shop-owner' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <Store size={14} />
            <span>{t.ownerTab[lang]}</span>
          </button>
        </div>

        {/* Actions (Cart, Theme, Mobile toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentPanel === 'customer' && (
            <button
              onClick={onOpenCart}
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', padding: '7px 12px' }}
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={16} />
              <span>{t.cartLabel[lang]}</span>
              {cartCount > 0 && (
                <span style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginLeft: '4px'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary btn-sm"
            style={{ width: 34, height: 34, padding: 0 }}
            title="Toggle Light / Dark Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--color-gold-bright)' }} /> : <Moon size={16} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-btn"
            style={{ width: 34, height: 34, padding: 0 }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          borderTop: '1px solid var(--border-color)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {lang === 'mr' ? 'विभाग निवडा' : lang === 'hi' ? 'विभाग चुनें' : 'Switch View'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              onClick={() => {
                setCurrentPanel('customer');
                setMobileMenuOpen(false);
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: currentPanel === 'customer' ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                color: currentPanel === 'customer' ? '#FFFFFF' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                minHeight: '38px'
              }}
            >
              <User size={14} />
              <span>{t.customerTab[lang]}</span>
            </button>

            <button
              onClick={() => {
                setCurrentPanel('shop-owner');
                setMobileMenuOpen(false);
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: currentPanel === 'shop-owner' ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                color: currentPanel === 'shop-owner' ? '#FFFFFF' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                minHeight: '38px'
              }}
            >
              <Store size={14} />
              <span>{t.ownerTab[lang]}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onOpenPrivacyModal();
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'flex-start', marginTop: '6px', minHeight: '38px' }}
          >
            <Lock size={14} style={{ color: 'var(--primary)' }} />
            <span>{t.privacyVault[lang]}</span>
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-panels {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
