import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import {
  Filter,
  RotateCcw,
  Star,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    primeOnly,
    setPrimeOnly,
    sortBy,
    setSortBy,
    resetFilters,
  } = useMarketplace();

  const categories = [
    'Toutes',
    'High-Tech',
    'Informatique',
    'Maison & Cuisine',
    'Mode & Beauté',
    'Livres & Médias',
  ];

  const brands = ['Toutes', 'Aura', 'NovaTech', 'PulseGear', 'ErgoMaster', 'AromaCraft', 'AeroSight', 'AeroStride'];

  // Filtering logic
  const filteredProducts = products.filter((prod) => {
    // Category filter
    if (selectedCategory !== 'Toutes' && prod.category !== selectedCategory) {
      return false;
    }
    // Brand filter
    if (selectedBrand !== 'Toutes' && prod.brand !== selectedBrand) {
      return false;
    }
    // Search keyword
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchCategory = prod.category.toLowerCase().includes(q);
      const matchTags = prod.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCategory && !matchTags) return false;
    }
    // Price filter
    if (prod.price > priceRange[1]) {
      return false;
    }
    // Rating filter
    if (prod.rating < minRating) {
      return false;
    }
    // Prime only
    if (primeOnly && !prod.primeEligible) {
      return false;
    }
    return true;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'sales') return b.salesVelocity - a.salesVelocity;
    return b.reviewCount - a.reviewCount; // featured
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title & Active Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {selectedCategory === 'Toutes' ? 'Tous les produits du catalogue' : selectedCategory}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {sortedProducts.length} résultat{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
            {searchQuery && <span> pour « {searchQuery} »</span>}
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Trier par :
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="featured">Pertinence & Recommandations IA</option>
            <option value="price-asc">Prix : Ordre croissant</option>
            <option value="price-desc">Prix : Ordre décroissant</option>
            <option value="rating">Moyenne des avis clients</option>
            <option value="sales">Meilleures ventes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtres dynamiques
            </span>
            <button
              onClick={resetFilters}
              className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Réinitialiser
            </button>
          </div>

          {/* Prime filter switch */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(e) => setPrimeOnly(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                <span className="italic text-amber-600">prime</span> Livraison 24h
              </span>
            </label>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 mb-2.5">Rayons & Catégories</h4>
            <div className="space-y-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition font-medium flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 mb-2.5">Marque</h4>
            <div className="space-y-1 text-xs">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition font-medium flex items-center justify-between ${
                    selectedBrand === b
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b}</span>
                  {selectedBrand === b && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="font-bold text-slate-900">Prix maximum :</span>
              <span className="font-extrabold text-amber-600">{priceRange[1]} €</span>
            </div>
            <input
              type="range"
              min={50}
              max={2500}
              step={50}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Rating filter */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 mb-2.5">Avis clients</h4>
            <div className="space-y-1.5 text-xs">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition flex items-center gap-2 ${
                    minRating === stars ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span>& plus</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid (9 cols) */}
        <div className="lg:col-span-9">
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800">Aucun produit ne correspond à vos filtres</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Essayez d'ajuster votre fourchette de prix ou d'élargir votre recherche.
              </p>
              <button
                onClick={resetFilters}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
