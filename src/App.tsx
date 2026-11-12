/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AboutPage } from './pages/AboutPage';
import { LocationPage } from './pages/LocationPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { PagesPreviewPage } from './pages/PagesPreviewPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminStoreSettingsPage } from './pages/admin/AdminStoreSettingsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/';
  });

  const [adminTab, setAdminTab] = useState<string>('pedidos');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parser
  const cleanPath = currentPath.split('?')[0];
  const queryString = currentPath.split('?')[1] || '';
  const searchParams = new URLSearchParams(queryString);

  // Check if route is admin
  const isAdminRoute = cleanPath.startsWith('/admin');

  // Render Admin Area
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return (
        <AdminLoginPage
          onSuccess={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    const renderAdminContent = () => {
      switch (adminTab) {
        case 'dashboard':
          return <AdminDashboardPage onSelectTab={setAdminTab} />;
        case 'pedidos':
          return <AdminOrdersPage />;
        case 'cardapio':
          return <AdminMenuPage />;
        case 'promocoes':
          return <AdminPromotionsPage />;
        case 'loja':
          return <AdminStoreSettingsPage />;
        case 'pagamentos':
          return <AdminPaymentsPage />;
        case 'usuarios':
          return <AdminUsersPage />;
        default:
          return <AdminOrdersPage />;
      }
    };

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onNavigateHome={() => navigate('/')}
      >
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // Parse Order Tracking route: /pedido/:id
  const isOrderTracking = cleanPath.startsWith('/pedido/');
  const orderId = isOrderTracking ? cleanPath.replace('/pedido/', '') : '';
  const orderToken = searchParams.get('token') || '';

  // Render Public Area
  const renderPublicPage = () => {
    if (isOrderTracking) {
      return (
        <OrderTrackingPage
          orderId={orderId}
          token={orderToken}
          onNavigate={navigate}
        />
      );
    }

    switch (cleanPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/cardapio':
        return <MenuPage onNavigate={navigate} />;
      case '/sobre':
        return <AboutPage onNavigate={navigate} />;
      case '/localizacao':
        return <LocationPage />;
      case '/contato':
        return <ContactPage />;
      case '/avaliacoes':
        return <HomePage onNavigate={navigate} />;
      case '/privacidade':
        return <PrivacyPolicyPage />;
      case '/termos':
        return <TermsPage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#E8365D] selection:text-white">
      <Header currentRoute={cleanPath} onNavigate={navigate} />

      <main className="flex-1">
        {renderPublicPage()}
      </main>

      <Footer onNavigate={navigate} />

      {/* Global Shopping Bag Slide-Over */}
      <CartDrawer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  // O GitHub Pages não oferece API de pedidos. Publicamos uma página
  // estática de contato, sem carrinho falso nem promessas de confirmação.
  if (import.meta.env.VITE_STATIC_PREVIEW === 'true') {
    return <PagesPreviewPage />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
