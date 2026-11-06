import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ChevronUp, ShieldCheck, Globe, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setCurrentRole, setSelectedCategory } = useMarketplace();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-16">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 text-center flex items-center justify-center gap-1.5 transition select-none"
      >
        <ChevronUp className="w-4 h-4" />
        <span>Retour en haut de page</span>
      </button>

      {/* Main Link Columns */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Pour mieux nous connaître</h4>
          <ul className="space-y-2 text-slate-400">
            <li><button onClick={() => setActiveView('home')} className="hover:text-amber-400 transition">À propos d'AuraMarket</button></li>
            <li><span className="hover:text-white cursor-pointer">Carrières & Talents</span></li>
            <li><span className="hover:text-white cursor-pointer">Engagements Éco-responsables</span></li>
            <li><span className="hover:text-white cursor-pointer">Aura Science & IA Gemini</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Gagnez de l'argent</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button
                onClick={() => {
                  setCurrentRole('seller');
                  setActiveView('seller-dashboard');
                }}
                className="text-amber-400 hover:underline font-semibold"
              >
                Vendez sur AuraMarket
              </button>
            </li>
            <li><span className="hover:text-white cursor-pointer">Expédié par Aura (Fulfillment)</span></li>
            <li><span className="hover:text-white cursor-pointer">Programme Partenaires & Affiliés</span></li>
            <li><span className="hover:text-white cursor-pointer">Faites la promotion de vos produits</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Moyens de paiement</h4>
          <ul className="space-y-2 text-slate-400">
            <li><span className="hover:text-white cursor-pointer">Carte Bancaire (3D-Secure)</span></li>
            <li><span className="hover:text-white cursor-pointer">Franc Guinéen (Orange 🇬🇳 & MTN 🇬🇳)</span></li>
            <li><span className="hover:text-white cursor-pointer">PayPal Express Checkout</span></li>
            <li><span className="hover:text-white cursor-pointer">Mobile Money UEMOA (Wave / MoMo)</span></li>
            <li><span className="hover:text-white cursor-pointer">Paiement en 4x sans frais</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Besoin d'aide ?</h4>
          <ul className="space-y-2 text-slate-400">
            <li><button onClick={() => setActiveView('orders')} className="hover:text-amber-400 transition">Vos commandes & Suivis</button></li>
            <li><span className="hover:text-white cursor-pointer">Tarifs et politiques de livraison</span></li>
            <li><span className="hover:text-white cursor-pointer">Retours et remplacements sous 30j</span></li>
            <li>
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setActiveView('admin-dashboard');
                }}
                className="text-purple-400 hover:underline"
              >
                Console Administration
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Brand & Copyright Strip */}
      <div className="border-t border-slate-800 py-6 text-center text-slate-500 text-[11px] space-y-2">
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <span className="font-bold text-white font-['Space_Grotesk'] text-base">
            aura<span className="text-amber-400">market</span>
          </span>
          <span>•</span>
          <span>France & Europe</span>
          <span>•</span>
          <span>Devises : EUR (€) / USD ($) / CFA (FCFA) / GNF (FG 🇬🇳)</span>
        </div>
        <p>© 2026 AuraMarket Platform, Inc. Inspirée d'Amazon – Architecture Multi-Vendeurs, IA & Haute Disponibilité.</p>
      </div>
    </footer>
  );
};
