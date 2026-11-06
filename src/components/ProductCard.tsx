import React from 'react';
import { Product } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { Star, ShoppingCart, Heart, Zap, Truck, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const {
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProductId,
    setActiveView,
  } = useMarketplace();

  const isFavorite = wishlist.includes(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setActiveView('product-detail');
  };

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {product.badge === 'Choix d\'Aura' && (
          <span className="bg-slate-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
            Choix d'<span className="text-amber-400">Aura</span>
          </span>
        )}
        {product.badge === 'Meilleure Vente' && (
          <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
            N°1 des ventes
          </span>
        )}
        {product.badge === 'Offre Flash' && (
          <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" /> Offre Flash
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition ${
          isFavorite
            ? 'bg-rose-50 text-rose-500 shadow'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
        }`}
        title="Ajouter à la liste d'envies"
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Image container */}
      <div
        onClick={handleCardClick}
        className="w-full h-48 sm:h-52 overflow-hidden bg-slate-50 cursor-pointer flex items-center justify-center p-3"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">{product.brand}</span>
            <span className="truncate max-w-[100px]">{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={handleCardClick}
            className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-amber-600 cursor-pointer line-clamp-2 transition leading-snug mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating Stars & Count */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.rating
                      ? 'fill-amber-200 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{product.rating}</span>
            <span className="text-[11px] text-slate-500">({product.reviewCount})</span>
          </div>

          {/* Price display */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.primeEligible && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-black italic bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-1 rounded">
                  prime
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                  Livraison demain gratuite
                </span>
              </div>
            )}
          </div>

          {/* Stock indication */}
          {product.stock <= 20 && (
            <p className="text-[11px] text-rose-600 font-semibold mb-2">
              Plus que {product.stock} exemplaires en stock !
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Ajouter au panier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
