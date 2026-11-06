import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Order, OrderStatus } from '../types';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';
import { InvoiceModal } from '../components/InvoiceModal';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, formatPrice, addToCart, setActiveView, setSelectedProductId, addToast } = useMarketplace();
  const [filterStatus, setFilterStatus] = useState<string>('Tous');
  const [searchOrder, setSearchOrder] = useState<string>('');
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'Tous' || order.status === filterStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchOrder.toLowerCase()) ||
      order.items.some((i) => i.product.name.toLowerCase().includes(searchOrder.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Livrée':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Expédiée':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Préparation':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Payée':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'En attente':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Annulée':
      case 'Remboursée':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    try {
      generateInvoicePdf(order, formatPrice);
      addToast({
        type: 'success',
        title: 'Facture PDF téléchargée !',
        message: `Le fichier Facture_AuraMarket_${order.orderNumber}.pdf est enregistré sur votre appareil.`,
      });
    } catch (err) {
      console.error('Invoice PDF download error:', err);
      setViewingInvoiceOrder(order);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vos commandes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des colis en direct, factures PDF et gestion des retours
          </p>
        </div>

        {/* Search Order bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              placeholder="Rechercher par n° ou article..."
              className="text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 w-64 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 text-xs no-scrollbar">
        {['Tous', 'En attente', 'Payée', 'Préparation', 'Expédiée', 'Livrée'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition whitespace-nowrap ${
              filterStatus === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">Aucune commande trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Vous n'avez pas de commande correspondant à vos critères de recherche.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition"
          >
            Explorer le catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Commande effectuée le</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total TTC</span>
                    <span className="font-black text-slate-900">{formatPrice(order.totalAmount)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Destinataire</span>
                    <span className="font-semibold text-slate-800">{order.shippingAddress.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 text-xs">{order.orderNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6 space-y-6">
                {/* Logistics timeline */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-500" />
                      Transporteur : <span className="text-slate-700">{order.carrier}</span>
                      <span className="text-slate-400 font-mono">({order.trackingNumber})</span>
                    </span>
                    <span className="text-emerald-700 font-bold">{order.estimatedDelivery}</span>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {order.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                          step.completed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{step.status}</span>
                          {step.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">{step.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-4 divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
                        />
                        <div>
                          <h4
                            onClick={() => {
                              setSelectedProductId(item.product.id);
                              setActiveView('product-detail');
                            }}
                            className="font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-600 cursor-pointer transition line-clamp-1"
                          >
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Quantité : <span className="font-semibold text-slate-700">{item.quantity}</span> • Vendeur :{' '}
                            <span className="text-slate-700">{item.product.sellerName}</span>
                          </p>
                          <span className="text-xs font-bold text-slate-900 mt-0.5 inline-block">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => addToCart(item.product, 1)}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                        >
                          Acheter à nouveau
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductId(item.product.id);
                            setActiveView('product-detail');
                          }}
                          className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          Écrire un avis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>Moyen de paiement : </span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {order.paymentMethod === 'card'
                        ? 'Carte Bancaire (3D-Secure)'
                        : order.paymentMethod === 'gnf_mobile'
                        ? `Franc Guinéen 🇬🇳 (${order.paymentDetails?.brand || 'Orange / MTN Guinée'})`
                        : order.paymentMethod === 'paypal'
                        ? 'PayPal Express'
                        : order.paymentMethod === 'mobile_money'
                        ? 'Mobile Money'
                        : 'Paiement à la livraison'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingInvoiceOrder(order)}
                      className="text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Voir la facture</span>
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        addToast({
                          type: 'info',
                          title: 'Étiquette de retour générée',
                          message: 'Votre étiquette Colissimo prépayée a été envoyée par email.',
                        });
                      }}
                      className="text-slate-700 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Retourner un article</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Legal Invoice Modal (Preview, Print & PDF) */}
      <InvoiceModal
        order={viewingInvoiceOrder}
        isOpen={Boolean(viewingInvoiceOrder)}
        onClose={() => setViewingInvoiceOrder(null)}
        formatPrice={formatPrice}
      />
    </div>
  );
};
