import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';
import { InvoiceModal } from '../components/InvoiceModal';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Download,
  Share2,
  Calendar,
  MapPin,
  CreditCard,
  Eye,
  FileText,
} from 'lucide-react';

export const OrderSuccessView: React.FC = () => {
  const { orders, selectedOrderId, formatPrice, setActiveView, setSelectedOrderId, addToast } = useMarketplace();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];

  if (!order) return null;

  const handleDownloadInvoice = () => {
    try {
      generateInvoicePdf(order, formatPrice);
      addToast({
        type: 'success',
        title: 'Facture PDF générée !',
        message: `Le fichier Facture_AuraMarket_${order.orderNumber}.pdf est téléchargé.`,
      });
    } catch (err) {
      console.error('PDF error:', err);
      setIsInvoiceModalOpen(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Commande Confirmée & Payée
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Merci pour votre commande, {order.shippingAddress.name.split(' ')[0]} !
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Numéro de commande : <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
          </p>
        </div>

        {/* Live Delivery Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Date estimée de livraison :</span>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>{order.estimatedDelivery}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Transporteur & Suivi :</span>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Truck className="w-4 h-4 text-amber-500" />
              <span className="truncate">{order.carrier}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{order.trackingNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Adresse de destination :</span>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="truncate">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</span>
            </div>
          </div>
        </div>

        {/* Timeline Preview */}
        <div className="pt-4 border-t border-slate-100 text-left">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Suivi des étapes logistiques :
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {order.timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                  step.completed
                    ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{step.status}</span>
                  {step.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-slate-500">{step.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setSelectedOrderId(order.id);
              setActiveView('orders');
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs shadow transition flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Consulter le détail & Suivi</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold px-4 py-3 rounded-xl text-xs shadow-sm transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Voir / Imprimer la facture</span>
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Télécharger la facture PDF</span>
          </button>

          <button
            onClick={() => setActiveView('catalog')}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs shadow transition flex items-center gap-2"
          >
            <span>Continuer mes achats</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoice Modal Preview, Print & PDF */}
      <InvoiceModal
        order={order}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        formatPrice={formatPrice}
      />
    </div>
  );
};
