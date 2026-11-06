import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, Review, CarrierOption } from '../types';
import { INITIAL_REVIEWS } from '../data/mockData';
import {
  Star,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Share2,
  Heart,
  ChevronRight,
  Store,
  Package,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setActiveView,
    addToast,
  } = useMarketplace();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierOption>(
    product?.carrierOptions?.[0] || { name: 'Chronopost Express', price: 0, days: 1 }
  );

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // AI Review Summary state
  const [aiSummary, setAiSummary] = useState<{
    sentiment: string;
    scoreRecommendation: number;
    pointsForts: string[];
    pointsVigilance: string[];
    syntheseGenerale: string;
  } | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);

    // Fetch AI Review Summary
    const fetchSummary = async () => {
      setIsAiSummaryLoading(true);
      try {
        const res = await fetch('/api/ai/review-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: product.name,
            reviews: reviews.map((r) => ({ rating: r.rating, comment: r.comment })),
          }),
        });
          if (res.ok) {
            const data = await res.json();
            setAiSummary(data);
          }
        } catch (err) {
          console.warn('AI summary fetch fallback:', err);
        } finally {
          setIsAiSummaryLoading(false);
        }
    };

    fetchSummary();
  }, [product?.id]);

  if (!product) return null;

  const isFavorite = wishlist.includes(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Cross-selling recommendations (other products in same category or popular)
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newTitle.trim()) return;

    setIsSubmittingReview(true);
    setTimeout(() => {
      const newRev: Review = {
        id: `rev-${Date.now()}`,
        productId: product.id,
        userId: 'usr-client-01',
        userName: 'Alexandre Dumas',
        rating: newRating,
        title: newTitle,
        comment: newComment,
        date: 'Aujourd\'hui',
        verifiedPurchase: true,
        helpfulCount: 0,
        sentiment: newRating >= 4 ? 'positive' : newRating === 3 ? 'neutral' : 'negative',
      };
      setReviews((prev) => [newRev, ...prev]);
      setNewTitle('');
      setNewComment('');
      setIsSubmittingReview(false);
      addToast({
        type: 'success',
        title: 'Avis vérifié publié !',
        message: 'Merci d\'avoir partagé votre expérience avec la communauté AuraMarket.',
      });
    }, 600);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedCarrier);
    setActiveView('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onClick={() => setActiveView('home')} className="hover:text-amber-600 transition">
          Accueil
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => setActiveView('catalog')} className="hover:text-amber-600 transition">
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.brand}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[480px]">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden bg-slate-50 flex-shrink-0 transition ${
                  activeImageIndex === idx ? 'border-amber-500 shadow-md ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Large Image */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center relative min-h-[380px] sm:min-h-[460px] shadow-sm">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow">
                -{discountPercent}%
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white shadow-md border border-slate-100 hover:text-rose-500 transition text-slate-400"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="max-h-[360px] max-w-full object-contain transition-all duration-300"
            />
          </div>
        </div>

        {/* Center Column: Details & Specs (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Boutique {product.brand}
              </span>
              <span className="text-xs text-slate-500">• SKU: {product.sku}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating & Review stats */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.rating
                      ? 'fill-amber-200 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-sm text-slate-800">{product.rating} sur 5</span>
            <span className="text-xs text-slate-500">• {product.reviewCount} évaluations certifiées</span>
          </div>

          {/* Price display */}
          <div className="space-y-1 py-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  Conseillé : {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Tous les prix incluent la TVA française (20%).</p>
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
            {product.shortDesc}
          </p>

          {/* Bullet point key features (Amazon style) */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              À propos de cet article :
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller profile reference */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-slate-600">Vendu par : </span>
                <span className="font-bold text-blue-900">{product.sellerName}</span>
                <div className="text-[11px] text-slate-500">Évaluation vendeur : {product.sellerRating} ★ (Excellente)</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Vendeur Vérifié
            </span>
          </div>
        </div>

        {/* Right Column: Amazon Buy Box (3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-lg space-y-4 sticky top-24">
            <div className="text-2xl font-black text-slate-900">
              {formatPrice(product.price * quantity)}
            </div>

            {/* Prime delivery statement */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-emerald-700">
                  {product.primeEligible ? 'Livraison 24h GRATUITE' : 'Livraison express disponible'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Commandez avant 18h pour être livré dès demain par <span className="font-semibold text-slate-800">{selectedCarrier.name}</span>.
              </p>
            </div>

            {/* Carrier selection dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Transporteur sélectionné :
              </label>
              <select
                value={selectedCarrier.name}
                onChange={(e) => {
                  const found = product.carrierOptions.find((c) => c.name === e.target.value);
                  if (found) setSelectedCarrier(found);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
              >
                {product.carrierOptions.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.price === 0 ? 'Gratuit' : `${c.price} €`}) • {c.days}j
                  </option>
                ))}
              </select>
            </div>

            {/* Stock status */}
            <div>
              {product.stock > 0 ? (
                <span className="text-emerald-700 font-extrabold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> En Stock ({product.stock} unités)
                </span>
              ) : (
                <span className="text-rose-600 font-bold text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Rupture de stock temporaire
                </span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Quantité :</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {[1, 2, 3, 4, 5, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => addToCart(product, quantity, selectedCarrier)}
                disabled={product.stock === 0}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-98"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter au panier</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>Acheter cet article maintenant</span>
              </button>
            </div>

            {/* Security and Return Guarantees */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Transaction sécurisée par chiffrement bancaire PCI-DSS</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Politique de retour gratuit sous 30 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>Emballage soigné respectueux de l'environnement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Review Summary Box */}
      <div className="mb-12 bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                Synthèse IA des Avis Clients
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Analyse sémantique en temps réel de tous les commentaires d'acheteurs vérifiés
              </p>
            </div>
          </div>

          {aiSummary && (
            <div className="flex items-center gap-2 bg-emerald-100/80 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <span>Satisfaction acheteurs : {aiSummary.scoreRecommendation}%</span>
            </div>
          )}
        </div>

        {isAiSummaryLoading ? (
          <div className="py-6 flex items-center justify-center gap-3 text-slate-500 text-xs">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Génération de la synthèse IA en cours...</span>
          </div>
        ) : aiSummary ? (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white/80 p-3.5 rounded-xl border border-amber-100">
              « {aiSummary.syntheseGenerale} »
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Points forts */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ce que les clients adorent :
                </h5>
                <ul className="space-y-1.5 text-emerald-800">
                  {aiSummary.pointsForts.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-600">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Points de vigilance */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5">
                <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Bon à savoir avant achat :
                </h5>
                <ul className="space-y-1.5 text-amber-800">
                  {aiSummary.pointsVigilance.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-600">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Customer Reviews & Submit form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left: Star breakdown & Write Review form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Évaluations clients</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-slate-900">{product.rating}</div>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500">{product.reviewCount} avis mondiaux</div>
              </div>
            </div>

            {/* Rating distribution bars */}
            <div className="space-y-2 text-xs">
              {[
                { stars: '5 étoiles', pct: 82 },
                { stars: '4 étoiles', pct: 12 },
                { stars: '3 étoiles', pct: 4 },
                { stars: '2 étoiles', pct: 1 },
                { stars: '1 étoile', pct: 1 },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-600">
                  <span className="w-16 truncate">{row.stars}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form to write an authenticated review */}
          <form onSubmit={handleAddReview} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <h4 className="font-bold text-sm text-slate-900">Écrire un commentaire client</h4>
            <p className="text-xs text-slate-500">
              Partagez votre avis pour aider les millions d'acheteurs d'AuraMarket.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Votre note globale :</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Titre du commentaire :</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Quel est le point le plus important à savoir ?"
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Votre avis détaillé :</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Qu'avez-vous particulièrement apprécié ou regretté ?"
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
            >
              {isSubmittingReview ? 'Publication en cours...' : 'Soumettre mon avis vérifié'}
            </button>
          </form>
        </div>

        {/* Right: Reviews List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Avis les plus utiles ({reviews.length})
          </h3>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {rev.userName[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{rev.userName}</h5>
                    <div className="text-[11px] text-slate-400">{rev.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-xs text-slate-900">{rev.title}</span>
                </div>

                {rev.verifiedPurchase && (
                  <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Achat vérifié
                  </span>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <button className="flex items-center gap-1 hover:text-slate-900 transition text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    <ThumbsUp className="w-3 h-3" /> Utile ({rev.helpfulCount})
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 text-[11px]">
                    Signaler
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequently bought together / AI Recommended cross-selling */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Produits souvent achetés ensemble & Recommandés par l'IA
            </h3>
            <p className="text-xs text-slate-500">
              Sélection basée sur les paniers d'autres acheteurs ayant consulté cet article
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map((relProd) => (
            <ProductCard key={relProd.id} product={relProd} />
          ))}
        </div>
      </div>
    </div>
  );
};
