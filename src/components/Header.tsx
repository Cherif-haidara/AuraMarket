import React, { useState, useRef, useEffect } from 'react';
import { useMarketplace, CurrencyType } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import {
  Search,
  ShoppingCart,
  MapPin,
  Sparkles,
  ChevronDown,
  User,
  Package,
  ShieldCheck,
  Store,
  Menu,
  Heart,
  X,
  Zap,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    cartCount,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    currency,
    setCurrency,
    user,
    wishlist,
    setIsAiChatOpen,
    products,
    setSelectedProductId,
  } = useMarketplace();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [activeAddressIndex, setActiveAddressIndex] = useState(0);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Toutes',
    'High-Tech',
    'Informatique',
    'Maison & Cuisine',
    'Mode & Beauté',
    'Livres & Médias',
  ];

  // Suggestions for autocomplete
  const filteredSuggestions = searchQuery.trim().length > 1
    ? products
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveView('catalog');
  };

  const handleSelectSuggestion = (prodId: string) => {
    setSelectedProductId(prodId);
    setShowSuggestions(false);
    setActiveView('product-detail');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
      {/* 1. Top Role Navigation Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Plateforme E-Commerce v1.0
            </span>
            <span className="hidden sm:inline text-slate-400">
              Marketplace multi-vendeurs avec IA, logistique & paiements sécurisés
            </span>
          </div>

          {/* Quick Role Impersonator */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400 font-medium mr-1">Rôle actif :</span>
            <button
              onClick={() => {
                setCurrentRole('client');
                if (activeView === 'seller-dashboard' || activeView === 'admin-dashboard') {
                  setActiveView('home');
                }
              }}
              className={`px-2.5 py-0.5 rounded font-medium transition text-xs flex items-center gap-1 ${
                currentRole === 'client'
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <User className="w-3 h-3" />
              Client
            </button>
            <button
              onClick={() => {
                setCurrentRole('seller');
                setActiveView('seller-dashboard');
              }}
              className={`px-2.5 py-0.5 rounded font-medium transition text-xs flex items-center gap-1 ${
                currentRole === 'seller'
                  ? 'bg-blue-500 text-white shadow font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Store className="w-3 h-3" />
              Vendeur (TechZone)
            </button>
            <button
              onClick={() => {
                setCurrentRole('admin');
                setActiveView('admin-dashboard');
              }}
              className={`px-2.5 py-0.5 rounded font-medium transition text-xs flex items-center gap-1 ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              Admin Global
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Amazon-Inspired Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3 sm:gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setActiveView('home');
            setSelectedProductId(null);
          }}
          className="cursor-pointer flex items-center gap-1.5 p-1 rounded hover:outline hover:outline-1 hover:outline-white/40 transition select-none flex-shrink-0"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-2xl tracking-tight text-white font-['Space_Grotesk']">
                aura<span className="text-amber-400">market</span>
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1 rounded uppercase tracking-wider">
                Prime
              </span>
            </div>
            {/* Amazon-like smile curve */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full mt-[-2px]" />
          </div>
        </div>

        {/* Deliver to address location & African destinations */}
        <div ref={locationRef} className="relative hidden md:block">
          <div
            onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
            className="flex items-center gap-1.5 p-1.5 rounded hover:outline hover:outline-1 hover:outline-white/40 cursor-pointer transition text-xs text-slate-300 select-none flex-shrink-0"
          >
            <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="leading-tight text-left">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Livrer à {user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="font-bold text-white text-xs truncate max-w-[130px]">
                {user.addresses[activeAddressIndex]?.city || 'Paris'} ({user.addresses[activeAddressIndex]?.country?.split(' ')[0] || 'France'})
              </div>
            </div>
          </div>

          {/* Location selector dropdown */}
          {isLocationMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs text-slate-900">Destination de livraison</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  54 Pays d'Afrique 🌍
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-slate-500">Sélectionnez une adresse enregistrée :</p>
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setActiveAddressIndex(idx);
                      setIsLocationMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                      activeAddressIndex === idx
                        ? 'border-amber-500 bg-amber-50/60 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-900">
                      <span>{addr.name}</span>
                      <span className="text-base">
                        {addr.country.includes('Guin') ? '🇬🇳' : addr.country.includes('Sén') ? '🇸🇳' : '🇫🇷'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {addr.street}, {addr.city} ({addr.country})
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Hub logistique express actif</span>
                <button
                  onClick={() => {
                    setActiveView('checkout');
                    setIsLocationMenuOpen(false);
                  }}
                  className="text-amber-600 hover:text-amber-700 font-bold text-[11px]"
                >
                  Ajouter un pays d'Afrique →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Smart Search Bar */}
        <div ref={searchContainerRef} className="flex-1 relative">
          <form onSubmit={handleSearchSubmit} className="flex w-full items-stretch rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-amber-500">
            {/* Category select dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setActiveView('catalog');
              }}
              className="bg-slate-100 text-slate-800 text-xs px-2.5 py-2 font-medium border-r border-slate-300 focus:outline-none cursor-pointer hidden sm:block max-w-[130px] truncate"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Rechercher sur AuraMarket (ex: casque sans fil, ultrabook, café...)"
              className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none min-w-0"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 flex items-center justify-center transition flex-shrink-0"
              title="Lancer la recherche"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 text-slate-900">
              <div className="bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
                <span>Suggestions rapides</span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Sparkles className="w-3 h-3" /> IA Sémantique
                </span>
              </div>
              {filteredSuggestions.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectSuggestion(prod.id)}
                  className="px-3 py-2.5 hover:bg-amber-50/60 cursor-pointer flex items-center gap-3 transition"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-10 h-10 object-cover rounded border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {prod.category} • <span className="font-bold text-amber-600">{prod.price.toFixed(2)} €</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currency & Language selector */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded hover:outline hover:outline-1 hover:outline-white/40 cursor-pointer text-xs font-bold text-slate-200 select-none">
          <span className="text-base">
            {currency === 'GNF' ? '🇬🇳' : currency === 'USD' ? '🇺🇸' : currency === 'XOF' ? '🌍' : '🇫🇷'}
          </span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyType)}
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="EUR" className="text-slate-900">EUR (€)</option>
            <option value="USD" className="text-slate-900">USD ($)</option>
            <option value="XOF" className="text-slate-900">CFA (FCFA)</option>
            <option value="GNF" className="text-slate-900">GNF (FG - Guinée 🇬🇳)</option>
          </select>
        </div>

        {/* Account & Lists dropdown */}
        <div
          onMouseEnter={() => setIsAccountMenuOpen(true)}
          onMouseLeave={() => setIsAccountMenuOpen(false)}
          className="relative p-1.5 rounded hover:outline hover:outline-1 hover:outline-white/40 cursor-pointer transition select-none flex-shrink-0"
        >
          <div className="text-left leading-tight">
            <div className="text-[11px] text-slate-400">Bonjour, {user.name.split(' ')[0]}</div>
            <div className="text-xs font-bold text-white flex items-center gap-0.5">
              <span>Compte & Listes</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Account Dropdown */}
          {isAccountMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="pb-2.5 mb-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                    Membre Aura Prime
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveView('orders');
                    setIsAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded font-medium flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  Vos Commandes & Suivis
                </button>
                <button
                  onClick={() => {
                    setActiveView('catalog');
                    setIsAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded font-medium flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  Votre Liste d'Envies ({wishlist.length})
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('seller');
                    setActiveView('seller-dashboard');
                    setIsAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-blue-50 text-blue-700 rounded font-medium flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-blue-600" />
                  Votre Espace Vendeur Pro
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setActiveView('admin-dashboard');
                    setIsAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-purple-50 text-purple-700 rounded font-medium flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Console Administrateur
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Returns & Orders quick link */}
        <div
          onClick={() => setActiveView('orders')}
          className="hidden sm:block p-1.5 rounded hover:outline hover:outline-1 hover:outline-white/40 cursor-pointer transition select-none flex-shrink-0"
        >
          <div className="text-[11px] text-slate-400">Retours</div>
          <div className="text-xs font-bold text-white">& Commandes</div>
        </div>

        {/* Cart Button */}
        <div
          onClick={() => setActiveView('cart')}
          className="relative flex items-center gap-1.5 p-1.5 rounded hover:outline hover:outline-1 hover:outline-white/40 cursor-pointer transition select-none flex-shrink-0 text-white"
        >
          <div className="relative">
            <ShoppingCart className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
              {cartCount}
            </span>
          </div>
          <span className="hidden sm:inline font-bold text-xs mt-2">Panier</span>
        </div>
      </div>

      {/* 3. Amazon Sub-navigation Bar */}
      <div className="bg-slate-800 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-t border-slate-700">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => {
              setSelectedCategory('Toutes');
              setActiveView('catalog');
            }}
            className="flex items-center gap-1 font-bold text-white hover:text-amber-400 transition"
          >
            <Menu className="w-4 h-4" />
            Toutes les catégories
          </button>

          <button
            onClick={() => {
              setActiveView('catalog');
            }}
            className="hover:text-amber-400 transition flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Ventes Flash du Jour
          </button>

          <button
            onClick={() => {
              setActiveView('catalog');
            }}
            className="hover:text-amber-400 transition font-medium"
          >
            Meilleures Ventes
          </button>

          <button
            onClick={() => {
              setActiveView('catalog');
            }}
            className="hover:text-amber-400 transition"
          >
            Nouveautés & High-Tech
          </button>

          <button
            onClick={() => {
              setCurrentRole('seller');
              setActiveView('seller-dashboard');
            }}
            className="text-blue-300 hover:text-blue-200 transition font-medium flex items-center gap-1"
          >
            <Store className="w-3.5 h-3.5" />
            Vendre sur AuraMarket
          </button>

          {/* AI Shopping Assistant Trigger */}
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="ml-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow transition transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Assistant IA Shopping</span>
          </button>
        </div>
      </div>
    </header>
  );
};
