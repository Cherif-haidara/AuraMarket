import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AiChatAssistant } from './components/AiChatAssistant';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { OrdersView } from './views/OrdersView';
import { SellerDashboardView } from './views/SellerDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { Sparkles, MessageSquare } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setIsAiChatOpen, isAiChatOpen } = useMarketplace();

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'catalog':
        return <CatalogView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-success':
        return <OrderSuccessView />;
      case 'orders':
        return <OrdersView />;
      case 'seller-dashboard':
        return <SellerDashboardView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <Header />

      <main className="flex-1">
        {renderView()}
      </main>

      <Footer />

      {/* Persistent Floating AI Chat Button on Bottom Right */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white transition transform hover:scale-105 active:scale-95"
          title="Ouvrir l'assistant IA AuraBot"
        >
          <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
          <span className="text-xs hidden sm:inline font-bold">Assistant IA Shopping</span>
        </button>
      )}

      {/* AI Chat Assistant Slide-Over Drawer */}
      <AiChatAssistant />

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MainContent />
    </MarketplaceProvider>
  );
}
