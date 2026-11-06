import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { SellerProfile, Dispute } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Layers,
  Search,
  Filter,
  Lock,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    platformMetrics,
    formatPrice,
    sellers,
    setSellers,
    disputes,
    setDisputes,
    products,
    addToast,
  } = useMarketplace();

  const [adminTab, setAdminTab] = useState<'sellers' | 'disputes' | 'logistics' | 'commissions'>('sellers');

  // Toggle seller verification
  const handleToggleSellerKyc = (sellerId: string) => {
    setSellers((prev) =>
      prev.map((s) => {
        if (s.id === sellerId) {
          const nextStatus = s.kycStatus === 'approved' ? 'pending' : 'approved';
          const nextVerified = nextStatus === 'approved';
          addToast({
            type: nextVerified ? 'success' : 'warning',
            title: nextVerified ? 'Vendeur validé' : 'Vendeur suspendu',
            message: `Le statut de ${s.storeName} est désormais : ${nextStatus.toUpperCase()}`,
          });
          return { ...s, kycStatus: nextStatus, verified: nextVerified };
        }
        return s;
      })
    );
  };

  // Resolve Dispute
  const handleResolveDispute = (disputeId: string, action: 'Remboursé' | 'Résolu') => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: action } : d))
    );
    addToast({
      type: 'success',
      title: 'Litige traité',
      message: `Le dossier a été marqué comme ${action}. Les parties ont été notifiées.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/30 text-purple-300 border border-purple-500/40">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black">Console d'Administration Globale</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Supervision multi-vendeurs, régulation des commissions, arbitrage des litiges et logs de sécurité
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-2xl">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">
            AuraShield™ : <span className="text-emerald-400 font-bold">100% Opérationnel</span>
          </span>
        </div>
      </div>

      {/* Global Marketplace Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Volume d'Affaires Brut (GMV)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPrice(platformMetrics.gmv)}</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            +24.1% vs trimestre précédent
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Commissions Prélevées</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">
            {formatPrice(platformMetrics.netRevenue)}
          </div>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">
            Taux moyen effectif : 12.0%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Vendeurs & Utilisateurs</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {sellers.length} boutiques / 84k clients
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-1 block">
            3 demandes d'onboarding en attente
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Litiges & Fraude</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {disputes.filter((d) => d.status === 'Ouvert' || d.status === 'En examen').length} dossiers actifs
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Taux d'incident plateforme : 0.02%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 text-xs font-bold">
        {[
          { id: 'sellers', label: `Gestion des Vendeurs & KYC (${sellers.length})` },
          { id: 'disputes', label: `Médiation Litiges & Remboursements (${disputes.length})` },
          { id: 'logistics', label: 'Supervision Logistique & Transporteurs' },
          { id: 'commissions', label: 'Barème des Commissions Marketplace' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`pb-3 px-4 transition border-b-2 ${
              adminTab === tab.id
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Sellers Management */}
      {adminTab === 'sellers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Boutiques et marchands partenaires</h3>
            <span className="text-xs text-slate-500">Conformité RGPD & directive DAC7 activée</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Boutique</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Date Inscription</th>
                  <th className="p-4">Volume Ventes</th>
                  <th className="p-4">Taux Commission</th>
                  <th className="p-4">Statut KYC</th>
                  <th className="p-4 text-right">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img src={s.logo} alt={s.storeName} className="w-10 h-10 rounded-xl object-cover border" />
                      <div>
                        <p className="font-bold text-slate-900">{s.storeName}</p>
                        <p className="text-[11px] text-slate-400">Note : {s.avgRating} ★ ({s.totalOrders} ventes)</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{s.email}</p>
                      <p className="text-slate-400">{s.phone}</p>
                    </td>
                    <td className="p-4 text-slate-600">{s.joinedDate}</td>
                    <td className="p-4 font-bold text-slate-900">{formatPrice(s.totalRevenue)}</td>
                    <td className="p-4 font-semibold text-purple-700">{(s.commissionRate * 100).toFixed(0)}%</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.kycStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.kycStatus === 'approved' ? 'Validé KYC' : 'En attente doc'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleSellerKyc(s.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                          s.kycStatus === 'approved'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {s.kycStatus === 'approved' ? 'Suspendre' : 'Valider'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Disputes & Mediation */}
      {adminTab === 'disputes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Centre d'Arbitrage et Litiges Clients</h3>
            <span className="text-xs text-slate-500">Garantie Aura A-à-Z</span>
          </div>

          <div className="space-y-4">
            {disputes.map((disp) => (
              <div key={disp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">{disp.orderNumber}</span>
                    <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      Priorité {disp.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Statut :</span>
                    <span className="font-bold text-slate-800">{disp.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Acheteur :</span>
                    <span className="font-semibold text-slate-800">{disp.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Vendeur concerné :</span>
                    <span className="font-semibold text-slate-800">{disp.sellerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Montant réclamé :</span>
                    <span className="font-bold text-slate-900">{formatPrice(disp.amount)}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700">Motif de la réclamation : </span>
                  <span className="text-slate-600">{disp.reason}</span>
                </div>

                {disp.status !== 'Remboursé' && disp.status !== 'Résolu' && (
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'Résolu')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Classer sans suite
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'Remboursé')}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Valider le remboursement intégral
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Logistics Supervision */}
      {adminTab === 'logistics' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-sm text-slate-900">
            Supervision de la logistique & Accords transporteurs (SLA)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Chronopost Express France', onTime: 99.2, activeDeliveries: 420, avgEta: '18h' },
              { name: 'DHL Express Europe', onTime: 98.7, activeDeliveries: 180, avgEta: '22h' },
              { name: 'Colissimo Standard', onTime: 96.5, activeDeliveries: 310, avgEta: '44h' },
            ].map((c) => (
              <div key={c.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <Truck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Respect des délais (SLA) :</span>
                    <span className="font-bold text-emerald-600">{c.onTime}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.onTime}%` }} />
                  </div>
                </div>
                <div className="pt-2 flex justify-between text-[11px] text-slate-500">
                  <span>Colis en transit : {c.activeDeliveries}</span>
                  <span>Délai moyen : {c.avgEta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Commission Rates */}
      {adminTab === 'commissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Grille tarifaire des commissions par catégorie</h3>
            <span className="text-xs text-slate-500">Prélèvement automatique à chaque vente</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { cat: 'High-Tech & Audio', rate: '8%', note: 'Volume élevé, marge modérée' },
              { cat: 'Informatique & Ordinateurs', rate: '7%', note: 'Panier moyen supérieur' },
              { cat: 'Mode, Textile & Beauté', rate: '15%', note: 'Marge élevée, retours fréquents' },
              { cat: 'Maison, Déco & Cuisine', rate: '12%', note: 'Taux standard marketplace' },
            ].map((comm) => (
              <div key={comm.cat} className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 space-y-1">
                <span className="font-bold text-purple-900">{comm.cat}</span>
                <div className="text-2xl font-black text-purple-800">{comm.rate}</div>
                <p className="text-[11px] text-slate-500">{comm.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
