import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Tag,
  ArrowRight,
  CheckCircle2,
  X,
  Truck,
  RotateCcw,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartShipping,
    cartTotal,
    couponDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    setActiveView,
    user,
  } = useMarketplace();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Votre panier AuraMarket est vide</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          Découvrez nos meilleures ventes, offres flash et nouveautés recommandées par l'intelligence artificielle.
        </p>
        <button
          onClick={() => setActiveView('catalog')}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow transition"
        >
          Continuer mes achats
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Votre panier d'achats</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
          <div className="flex justify-between items-center pb-4 text-xs font-semibold text-slate-500 uppercase">
            <span>Articles ({cart.length})</span>
            <span>Prix unitaire</span>
          </div>

          {cart.map((item) => (
            <div key={item.product.id} className="py-5 flex flex-col sm:flex-row gap-4 items-start">
              {/* Product Thumbnail */}
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
              />

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 mb-1">
                  {item.product.name}
                </h3>
                <p className="text-xs text-slate-500 mb-1.5">
                  Vendu par : <span className="font-semibold text-slate-700">{item.product.sellerName}</span>
                </p>

                {item.product.primeEligible && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-2">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Éligible Aura Prime (Livraison 24h offerte)</span>
                  </div>
                )}

                {/* Quantity Controls & Remove */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 transition"
                      title="Diminuer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 font-bold text-xs text-slate-900 min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 transition"
                      title="Augmenter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              {/* Item Price */}
              <div className="text-right sm:self-start">
                <span className="text-base font-extrabold text-slate-900">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
                {item.quantity > 1 && (
                  <div className="text-[11px] text-slate-400">
                    ({formatPrice(item.product.price)} / unité)
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Subtotal bottom indicator */}
          <div className="pt-4 flex justify-between items-center text-sm">
            <span className="text-slate-600">Sous-total des articles :</span>
            <span className="font-extrabold text-slate-900 text-lg">
              {formatPrice(cartSubtotal)}
            </span>
          </div>
        </div>

        {/* Order Summary & Checkout Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
              Récapitulatif de commande
            </h2>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-slate-900">{formatPrice(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison :</span>
                <span className="font-semibold text-slate-900">
                  {cartShipping === 0 ? (
                    <span className="text-emerald-700 font-bold">GRATUIT</span>
                  ) : (
                    formatPrice(cartShipping)
                  )}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Remise ({appliedCoupon})</span>
                  </div>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>TVA incluse (20%) :</span>
                <span>{formatPrice(cartSubtotal * 0.20)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-slate-900 items-baseline">
                <span className="text-sm font-bold">Total TTC :</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Code promo (ex: AMAZON10)"
                  className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 uppercase font-medium focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-lg text-xs transition"
                >
                  Appliquer
                </button>
              </form>

              {couponError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                  <span>Coupon {appliedCoupon} actif</span>
                  <button onClick={removeCoupon} className="text-rose-500 hover:underline">
                    Retirer
                  </button>
                </div>
              )}

              {/* Sample coupons tip */}
              <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-1">
                <span>Codes actifs :</span>
                <button
                  onClick={() => applyCoupon('WELCOME20')}
                  className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold hover:bg-amber-200 transition"
                >
                  WELCOME20 (-20€)
                </button>
                <button
                  onClick={() => applyCoupon('AMAZON10')}
                  className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold hover:bg-amber-200 transition"
                >
                  AMAZON10 (-10%)
                </button>
              </div>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={() => setActiveView('checkout')}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Passer la commande</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Guarantees */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paiement 100% sécurisé crypté SSL 256 bits</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Garantie « Satisfait ou Remboursé » 30 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
