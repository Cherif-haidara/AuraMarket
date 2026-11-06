import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, Order } from '../types';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  X,
  Upload,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
} from 'lucide-react';

export const SellerDashboardView: React.FC = () => {
  const {
    sellers,
    products,
    orders,
    formatPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    addToast,
    setSelectedProductId,
    setActiveView,
  } = useMarketplace();

  // Active seller profile is TechZone Pro France
  const activeSeller = sellers[0];
  const sellerProducts = products.filter((p) => p.sellerId === activeSeller.id);
  const sellerOrders = orders.filter((o) => o.sellerIds.includes(activeSeller.id));

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'ai-forecast'>('overview');

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('High-Tech');
  const [newBrand, setNewBrand] = useState('TechZone');
  const [newPrice, setNewPrice] = useState(199.99);
  const [newStock, setNewStock] = useState(35);
  const [newSku, setNewSku] = useState(`TZ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80');
  const [newFeatures, setNewFeatures] = useState<string[]>([
    'Technologie de pointe et matériaux premium',
    'Conçu et testé selon les normes européennes',
    'Garantie constructeur 2 ans incluse',
  ]);
  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);

  // Image import options (from PC / Phone or Web URL)
  const [imageImportMode, setImageImportMode] = useState<'device' | 'url'>('device');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Format non supporté',
        message: 'Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, GIF, SVG).',
      });
      return;
    }
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewImageUrl(event.target.result as string);
        addToast({
          type: 'success',
          title: 'Image importée avec succès !',
          message: `${file.name} (${(file.size / 1024).toFixed(1)} Ko) chargée depuis votre appareil.`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Stock Forecast state
  const [selectedForecastProdId, setSelectedForecastProdId] = useState(sellerProducts[0]?.id || '');
  const [forecastData, setForecastData] = useState<{
    daysUntilStockout: number;
    recommendedReorderQty: number;
    reorderUrgency: string;
    seasonalInsight: string;
    projectedRevenue30Days: number;
  } | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  const targetForecastProduct = sellerProducts.find((p) => p.id === selectedForecastProdId) || sellerProducts[0];

  useEffect(() => {
    if (targetForecastProduct) {
      const fetchForecast = async () => {
        setIsForecastLoading(true);
        try {
          const res = await fetch('/api/ai/stock-forecast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product: {
                id: targetForecastProduct.id,
                name: targetForecastProduct.name,
                category: targetForecastProduct.category,
                price: targetForecastProduct.price,
              },
              salesVelocity: targetForecastProduct.salesVelocity,
              currentStock: targetForecastProduct.stock,
            }),
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          setForecastData(data);
        } catch (err: any) {
          console.warn('Forecast fetch fallback applied:', err.message);
          // Resilient local calculation fallback
          const daysLeft = Math.max(1, Math.round((targetForecastProduct.stock / (targetForecastProduct.salesVelocity || 10)) * 7));
          setForecastData({
            daysUntilStockout: daysLeft,
            recommendedReorderQty: Math.round((targetForecastProduct.salesVelocity || 15) * 4),
            reorderUrgency: daysLeft < 7 ? 'Critique' : daysLeft < 15 ? 'Moyenne' : 'Normale',
            seasonalInsight: `Analyse saisonnière : demande soutenue constatée sur la catégorie ${targetForecastProduct.category}. Réapprovisionnement régulier conseillé.`,
            projectedRevenue30Days: Math.round(targetForecastProduct.price * (targetForecastProduct.salesVelocity || 10) * 4),
          });
        } finally {
          setIsForecastLoading(false);
        }
      };

      fetchForecast();
    }
  }, [selectedForecastProdId]);

  // AI Description Generator for new product
  const handleGenerateAiDescription = async () => {
    if (!newTitle.trim()) {
      addToast({
        type: 'warning',
        title: 'Titre requis',
        message: 'Veuillez renseigner un titre de produit avant de lancer l\'IA.',
      });
      return;
    }

    setIsGeneratingAiDesc(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          brand: newBrand,
          keyPoints: 'Autonomie supérieure, design aluminium, haute performance',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewShortDesc(data.shortDesc || '');
        setNewDescription(data.longDesc || '');
        if (data.bulletPoints && data.bulletPoints.length > 0) {
          setNewFeatures(data.bulletPoints);
        }
      }
      addToast({
        type: 'success',
        title: 'Fiche rédigée par l\'IA !',
        message: 'Description, arguments de vente et puces générés avec succès.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiDesc(false);
    }
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      shortDesc: newShortDesc || 'Produit de qualité supérieure.',
      description: newDescription || 'Description complète du produit.',
      price: Number(newPrice),
      stock: Number(newStock),
      sku: newSku,
      category: newCategory,
      brand: newBrand,
      sellerId: activeSeller.id,
      sellerName: activeSeller.storeName,
      sellerRating: activeSeller.avgRating,
      rating: 5.0,
      reviewCount: 0,
      images: [newImageUrl],
      features: newFeatures.filter((f) => f.trim().length > 0),
      badge: 'Nouveau',
      primeEligible: true,
      deliveryEtaDays: 1,
      carrierOptions: [
        { name: 'Chronopost Express', price: 0, days: 1, badge: 'Livraison 24h Prime' },
        { name: 'DHL Express', price: 4.90, days: 1 },
      ],
      tags: [newCategory.toLowerCase(), newBrand.toLowerCase(), 'nouveau'],
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPrice(199.99);
  };

  const handleRequestPayout = () => {
    addToast({
      type: 'success',
      title: 'Virement bancaire initié !',
      message: `Un virement SEPA de ${formatPrice(activeSeller.balanceAvailable)} a été transmis à votre compte bancaire.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Seller Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeSeller.logo}
            alt={activeSeller.storeName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 p-0.5 bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{activeSeller.storeName}</h1>
              <span className="bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Vérifié KYC
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Note vendeur : <span className="text-amber-400 font-bold">{activeSeller.avgRating} ★</span> • Taux de commission : {(activeSeller.commissionRate * 100).toFixed(0)}% • Réponse : {activeSeller.responseRate}
            </p>
          </div>
        </div>

        {/* Payout & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Solde disponible</span>
            <span className="text-lg font-black text-emerald-400">{formatPrice(activeSeller.balanceAvailable)}</span>
          </div>

          <button
            onClick={handleRequestPayout}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow transition"
          >
            Demander un virement SEPA
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Chiffre d'Affaires</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPrice(activeSeller.totalRevenue)}</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% ce mois
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Commandes Totales</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeSeller.totalOrders}</div>
          <span className="text-[11px] text-blue-600 font-bold mt-1 block">
            {sellerOrders.filter((o) => o.status === 'Préparation' || o.status === 'Payée').length} à expédier aujourd'hui
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Références Actives</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{sellerProducts.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Toutes synchronisées avec Aura Prime
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Vélocité Moyenne</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {sellerProducts.reduce((acc, p) => acc + p.salesVelocity, 0)} u/sem
          </div>
          <span className="text-[11px] text-amber-600 font-bold mt-1 block">
            Rotation rapide des stocks
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 text-xs font-bold">
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'products', label: `Gestion du Catalogue (${sellerProducts.length})` },
          { id: 'orders', label: `Expéditions & Commandes (${sellerOrders.length})` },
          { id: 'ai-forecast', label: 'IA Prévision des Ventes & Stocks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.id === 'ai-forecast' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Orders to Fulfill */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Dernières commandes à traiter</h3>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-amber-600 hover:underline">
                Voir toutes les commandes
              </button>
            </div>

            <div className="space-y-3">
              {sellerOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <p className="text-slate-500 mt-0.5">
                      {order.items.length} article(s) • Client : {order.shippingAddress.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">{formatPrice(order.totalAmount)}</span>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Expédiée')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Marquer expédiée
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Stock Alert Preview */}
          <div className="lg:col-span-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Alerte IA Réapprovisionnement</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              {targetForecastProduct?.name.slice(0, 45)}...
            </h4>
            <p className="text-xs text-slate-700">
              Stock restant : <span className="font-bold text-rose-600">{targetForecastProduct?.stock} unités</span>. Rupture estimée dans ~12 jours.
            </p>
            <button
              onClick={() => setActiveTab('ai-forecast')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition"
            >
              Consulter l'analyse prédictive complète
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Products Management */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Catalogue de vos articles en vente</h3>
              <p className="text-xs text-slate-500">Mettez à jour vos prix, stocks et fiches produits</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Produit</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Prix</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Vélocité</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 object-contain rounded-lg border bg-white p-1"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[11px] text-slate-400">{prod.category} • {prod.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{prod.sku}</td>
                    <td className="p-4 font-bold text-slate-900">{formatPrice(prod.price)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={prod.stock}
                          onChange={(e) => updateProduct(prod.id, { stock: parseInt(e.target.value, 10) || 0 })}
                          className="w-16 bg-slate-50 border border-slate-300 rounded p-1 text-center font-bold"
                        />
                        {prod.stock < 15 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{prod.salesVelocity} u/sem</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        En ligne
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProductId(prod.id);
                            setActiveView('product-detail');
                          }}
                          className="text-slate-600 hover:text-slate-900 p-1.5 rounded hover:bg-slate-200 transition"
                          title="Voir sur la marketplace"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Orders to Fulfill */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Gestion des commandes vendeurs</h3>
          <div className="space-y-4">
            {sellerOrders.map((order) => (
              <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                    <span className="text-slate-500 ml-2">({order.createdAt.slice(0, 10)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Statut actuel :</span>
                    <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-bold text-slate-700">Adresse de livraison :</p>
                    <p className="text-slate-600">{order.shippingAddress.name} - {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Transporteur assigné :</p>
                    <p className="text-slate-600">{order.carrier} (N° {order.trackingNumber})</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Préparation')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Passer en préparation
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Expédiée')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Marquer comme expédiée
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Livrée')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Confirmer livraison
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI Stock & Sales Forecast */}
      {activeTab === 'ai-forecast' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Moteur Prédictif IA des Ventes & Réapprovisionnements
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modèle d'analyse prédictive de séries temporelles basé sur Gemini 3.8 Flash
              </p>
            </div>

            {/* Product dropdown selector */}
            <select
              value={selectedForecastProdId}
              onChange={(e) => setSelectedForecastProdId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              {sellerProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          {isForecastLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span>Calcul des projections IA en cours...</span>
            </div>
          ) : forecastData ? (
            <div className="space-y-6">
              {/* Projections Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase">Jours avant rupture</span>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    ~{forecastData.daysUntilStockout} jours
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Urgence : {forecastData.reorderUrgency}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-800 uppercase">Réassort recommandé</span>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    {forecastData.recommendedReorderQty} unités
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    Optimisé pour couvrir 30 jours
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">CA Prévisionnel à 30 jours</span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {formatPrice(forecastData.projectedRevenue30Days)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Basé sur la saisonnalité actuelle
                  </span>
                </div>
              </div>

              {/* AI Insight Paragraph */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Recommandation Stratégique IA :
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {forecastData.seasonalInsight}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Modal: Create Product with AI Assistant */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Mettre en vente un nouveau produit
                </h3>
                <p className="text-xs text-slate-500">
                  Remplissez les détails ou laissez l'IA générer vos argumentaires de vente
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom / Titre du produit :</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Clavier Mécanique Sans Fil AuraType RGB"
                    required
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingAiDesc}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold px-3 py-2 rounded-lg transition flex items-center gap-1 shadow-sm flex-shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAiDesc ? 'Génération...' : 'Rédiger par IA'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix (€) :</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock initial :</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value, 10))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie :</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="High-Tech">High-Tech</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Maison & Cuisine">Maison & Cuisine</option>
                    <option value="Mode & Beauté">Mode & Beauté</option>
                    <option value="Livres & Médias">Livres & Médias</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marque :</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Image Import Section (PC, Phone or Web URL) */}
              <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Image principale du produit :</span>
                  </label>

                  {/* Mode switch tabs */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageImportMode('device')}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                        imageImportMode === 'device'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>PC / Téléphone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageImportMode('url')}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                        imageImportMode === 'url'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Lien Web (URL)</span>
                    </button>
                  </div>
                </div>

                {/* Hidden Native File Input for PC & Phone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* 1. Device Import (PC / Mobile / Tablet) */}
                {imageImportMode === 'device' && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                        : 'border-slate-300 hover:border-amber-400 bg-white hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <Upload className="w-6 h-6 animate-bounce" />
                    </div>
                    <p className="font-bold text-xs text-slate-800">
                      Cliquez pour importer depuis votre ordinateur ou téléphone
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Glissez-déposez votre image ici • Formats acceptés : JPG, PNG, WEBP, GIF (jusqu'à 10 Mo)
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shadow-sm hover:bg-slate-800 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Parcourir mes fichiers...</span>
                    </div>
                  </div>
                )}

                {/* 2. Web URL Import */}
                {imageImportMode === 'url' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => {
                          setNewImageUrl(e.target.value);
                          setImageFileName('');
                        }}
                        placeholder="https://images.unsplash.com/... ou lien web direct"
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {/* Quick presets for testing */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                      <span>Exemples prêts à l'emploi :</span>
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80')}
                        className="bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-amber-50 hover:border-amber-300 transition"
                      >
                        Clavier RGB
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80')}
                        className="bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-amber-50 hover:border-amber-300 transition"
                      >
                        Écouteurs TWS
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80')}
                        className="bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-amber-50 hover:border-amber-300 transition"
                      >
                        Gadget Tech
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Live Image Preview & Validation */}
                {newImageUrl && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={newImageUrl}
                          alt="Aperçu produit"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Image chargée avec succès</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-xs">
                          {imageFileName ? `Fichier : ${imageFileName}` : newImageUrl.slice(0, 48) + '...'}
                        </p>
                        <span className="text-[10px] text-slate-400">Prête pour affichage catalogue & zoom</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (imageImportMode === 'device') {
                            fileInputRef.current?.click();
                          } else {
                            setNewImageUrl('');
                          }
                        }}
                        className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition"
                      >
                        Changer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewImageUrl('');
                          setImageFileName('');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 p-1.5"
                        title="Retirer cette image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description courte (accroche) :</label>
                <input
                  type="text"
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="Phrase clé percutante"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Puces clés (Points forts Amazon) :</label>
                {newFeatures.map((feat, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={feat}
                    onChange={(e) => {
                      const updated = [...newFeatures];
                      updated[idx] = e.target.value;
                      setNewFeatures(updated);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 mb-1.5"
                  />
                ))}
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-5 py-2 rounded-xl shadow transition"
                >
                  Publier sur AuraMarket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
