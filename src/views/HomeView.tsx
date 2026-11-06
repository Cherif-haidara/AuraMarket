import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight,
  Award,
  Headphones,
  Laptop,
  Home,
  ShoppingBag,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    products,
    formatPrice,
    setSelectedCategory,
    setActiveView,
    setIsAiChatOpen,
    setSelectedProductId,
  } = useMarketplace();

  // Countdown timer for Flash Deals (e.g. 05:42:19)
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashDeals = products.filter((p) => p.badge === 'Offre Flash' || (p.originalPrice && p.originalPrice > p.price)).slice(0, 4);
  const bestSellers = products.filter((p) => p.badge === 'Meilleure Vente' || p.badge === 'Choix d\'Aura').slice(0, 4);
  const aiRecommended = products.slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Banner with Amazon-Inspired Gradient & Backdrop */}
      <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden pb-16 pt-8">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommandations & Shopping Propulsés par Gemini 3.8</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Tout ce que vous aimez, livré dès demain avec{' '}
                <span className="text-amber-400">Aura Prime</span>.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Explorez des milliers d'articles vérifiés, bénéficiez de la livraison express 24h avec Chronopost et DHL, et payez en toute sécurité par CB, PayPal ou Mobile Money.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory('Toutes');
                    setActiveView('catalog');
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-amber-400/20 transition flex items-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explorer le Catalogue</span>
                </button>

                <button
                  onClick={() => setIsAiChatOpen(true)}
                  className="bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Demander conseil à l'IA</span>
                </button>
              </div>

              {/* Guarantees chips */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-xs text-slate-300 max-w-lg">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Livraison 24h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Paiement Sécurisé</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>Garantie 30 Jours</span>
                </div>
              </div>
            </div>

            {/* Right Hero Product Card Showcase */}
            <div className="lg:col-span-5 hidden lg:block">
              <div
                onClick={() => {
                  setSelectedProductId(products[0].id);
                  setActiveView('product-detail');
                }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-2xl cursor-pointer hover:scale-102 transition duration-300"
              >
                <div className="relative rounded-2xl overflow-hidden bg-white p-4 h-64 flex items-center justify-center">
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                    Offre Vedette -24%
                  </span>
                  <img
                    src={products[0].images[0]}
                    alt={products[0].name}
                    className="max-h-52 object-contain"
                  />
                </div>
                <div className="mt-4 text-white">
                  <div className="text-xs text-amber-300 font-bold">Produit Phare de la Semaine</div>
                  <h3 className="font-bold text-sm text-white line-clamp-1 mt-0.5">
                    {products[0].name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-amber-400">
                      {formatPrice(products[0].price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(products[0].originalPrice || 329.99)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Amazon-style Department Category Grid Cards (Overlapping Hero) */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: High-Tech */}
          <div
            onClick={() => {
              setSelectedCategory('High-Tech');
              setActiveView('catalog');
            }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base text-slate-900">Audio & High-Tech</h3>
                <Headphones className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 mb-3">Casques à réduction de bruit, montres connectées et drones 4K.</p>
              <div className="h-36 rounded-xl overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={products[0].images[0]}
                  alt="High-Tech"
                  className="max-h-32 object-contain hover:scale-105 transition"
                />
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-4">
              Explorer le rayon <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Informatique */}
          <div
            onClick={() => {
              setSelectedCategory('Informatique');
              setActiveView('catalog');
            }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base text-slate-900">PC & Informatique</h3>
                <Laptop className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 mb-3">Ultrabooks OLED, stations graphiques et accessoires pro.</p>
              <div className="h-36 rounded-xl overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={products[1].images[0]}
                  alt="Informatique"
                  className="max-h-32 object-contain hover:scale-105 transition"
                />
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4">
              Explorer le rayon <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Maison & Barista */}
          <div
            onClick={() => {
              setSelectedCategory('Maison & Cuisine');
              setActiveView('catalog');
            }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base text-slate-900">Maison & Cuisine</h3>
                <Home className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 mb-3">Machines espresso à grain, mobilier ergonomique et déco.</p>
              <div className="h-36 rounded-xl overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={products[4].images[0]}
                  alt="Maison"
                  className="max-h-32 object-contain hover:scale-105 transition"
                />
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4">
              Explorer le rayon <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: Assistant IA & Espace Vendeur */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-white">IA Shopping Advisor</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Trouvez le cadeau parfait en décrivant vos envies en langage naturel. Notre IA compare le catalogue en temps réel.
              </p>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-amber-300 font-mono">
                « Quel est le meilleur casque pour voyager en train ? »
              </div>
            </div>

            <button
              onClick={() => setIsAiChatOpen(true)}
              className="mt-4 w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <span>Démarrer une session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Flash Deals Section with Countdown */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  Ventes Flash & Bonnes Affaires du Jour
                </h2>
                <p className="text-xs text-slate-500">
                  Offres à durée limitée jusqu'à épuisement des stocks
                </p>
              </div>
            </div>

            {/* Countdown timer pill */}
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-700">
              <Clock className="w-4 h-4" />
              <span>
                Fin dans : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Flash Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashDeals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. AI Personalized Recommendations */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommandé pour vous par l'IA</h2>
              <p className="text-xs text-slate-500">
                Suggestions personnalisées selon vos préférences de navigation récentes
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('catalog')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiRecommended.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};
