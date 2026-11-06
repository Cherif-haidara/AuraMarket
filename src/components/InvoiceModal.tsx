import React from 'react';
import { Order } from '../types';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Truck,
  Building,
  User,
} from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (n: number) => string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  formatPrice,
}) => {
  if (!isOpen || !order) return null;

  const handleDownloadPdf = () => {
    generateInvoicePdf(order, formatPrice);
  };

  const handlePrint = () => {
    window.print();
  };

  const gnfEquivalent = Math.round(order.totalAmount * 9350);
  const formattedGnf = new Intl.NumberFormat('fr-FR').format(gnfEquivalent) + ' FG';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Facture Officielle {order.orderNumber}
              </h3>
              <p className="text-[11px] text-slate-400">
                Document d'achat certifié acquitté • Téléchargeable en PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
              title="Imprimer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PDF (.pdf)</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-2xl tracking-tight text-slate-950 font-['Space_Grotesk']">
                  aura<span className="text-amber-500">market</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded uppercase">
                  Prime
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Plateforme E-Commerce Internationale (Europe & 54 Pays d'Afrique)
              </p>
              <p className="text-[10px] text-slate-400">
                Siège : 42 Avenue des Champs-Élysées, 75008 Paris • N° TVA : FR 89 2026 894 100
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-full border border-emerald-300">
                FACTURE ACQUITTÉE
              </span>
              <div className="text-sm font-black text-slate-900 mt-2 font-mono">
                {order.orderNumber}
              </div>
              <div className="text-xs text-slate-500">
                Date : {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Issuer and Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[11px] mb-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Émetteur & Vendeur :</span>
              </div>
              <p className="font-semibold text-slate-800">AuraMarket International Platform</p>
              <p className="text-slate-600">Vendeur agréé : {order.items[0]?.product.sellerName}</p>
              <p className="text-slate-500">Support : support@auramarket.com</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[11px] mb-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Acheteur / Facturé à :</span>
              </div>
              <p className="font-bold text-slate-900">{order.shippingAddress.name}</p>
              <p className="text-slate-600">{order.shippingAddress.street}</p>
              <p className="text-slate-600">
                {order.shippingAddress.postalCode} {order.shippingAddress.city},{' '}
                <span className="font-bold text-slate-800">{order.shippingAddress.country}</span>
              </p>
              <p className="text-slate-500">Tél : {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment & Logistics details */}
          <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Règlement : </span>
                <span className="text-slate-700">
                  {order.paymentMethod === 'gnf_mobile'
                    ? `Franc Guinéen 🇬🇳 (${order.paymentDetails?.brand || 'Orange/MTN MoMo'})`
                    : order.paymentMethod === 'card'
                    ? 'Carte Bancaire (3D-Secure)'
                    : order.paymentMethod === 'mobile_money'
                    ? 'Mobile Money UEMOA'
                    : order.paymentMethod === 'paypal'
                    ? 'PayPal'
                    : 'Paiement à la livraison'}
                </span>
                <span className="text-slate-500 font-mono text-[11px] ml-1">
                  (Réf: {order.paymentDetails?.transactionId || 'TXN-9982410'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>{order.carrier}</span>
              <span className="font-mono text-slate-500">({order.trackingNumber})</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Désignation</th>
                  <th className="p-3">Réf / SKU</th>
                  <th className="p-3 text-center">Qté</th>
                  <th className="p-3 text-right">P.U. HT</th>
                  <th className="p-3 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900 max-w-xs">
                      {item.product.name}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{item.product.sku}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="p-3 text-right font-medium text-slate-600">
                      {(item.product.price * 0.8333).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {(item.product.price * item.quantity * 0.8333).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
            {/* Guarantees Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1.5 flex-1 max-w-sm">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Paiement certifié & Garantie 30 Jours</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Facture émise sous forme électronique valant reçu de paiement et certificat de garantie constructeur européenne et africaine.
              </p>
              <div className="pt-1 font-bold text-slate-900 text-xs">
                Équivalent en Francs Guinéens : <span className="text-emerald-700">{formattedGnf}</span>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-64 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT :</span>
                <span className="font-semibold text-slate-900">{(order.subtotal * 0.8333).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison :</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? 'Gratuit' : `${order.shippingFee.toFixed(2)} €`}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Remise ({order.couponCode || 'PROMO'}) :</span>
                  <span>-{order.discountAmount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>TVA (20%) :</span>
                <span>{(order.subtotal * 0.1667).toFixed(2)} €</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline text-slate-950">
                <span className="font-bold text-sm">Total TTC :</span>
                <span className="text-xl font-black text-slate-950">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
            AuraMarket Platform Inc. • Facture acquittée électroniquement • Conforme article 289-VII du CGI et normes OHADA.
          </div>
        </div>
      </div>
    </div>
  );
};
