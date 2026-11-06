import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Address, CarrierOption } from '../types';
import { ALL_SHIPPING_COUNTRIES, AFRICAN_COUNTRIES } from '../data/africanCountries';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Banknote,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartTotal,
    cartSubtotal,
    cartShipping,
    couponDiscount,
    appliedCoupon,
    formatPrice,
    user,
    createOrder,
    setActiveView,
    setSelectedOrderId,
  } = useMarketplace();

  // Step state
  const [selectedAddress, setSelectedAddress] = useState<Address>(user.addresses[0]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('Guinée (Conakry)');
  const [newPhone, setNewPhone] = useState('+224 620 00 00 00');

  // Carrier state
  const carrierOptions: CarrierOption[] = [
    { name: 'Chronopost Express', price: 0, days: 1, badge: 'Livraison demain garantie' },
    { name: 'DHL Express', price: 4.90, days: 1, badge: 'Suivi premium par SMS' },
    { name: 'Colissimo Standard', price: 0, days: 3 },
  ];
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierOption>(carrierOptions[0]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'mobile_money' | 'cod' | 'gnf_mobile'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [mobileOperator, setMobileOperator] = useState('Orange Money');
  const [mobileNumber, setMobileNumber] = useState('+33 6 12 34 56 78');

  // Guinean Franc (GNF) payment state
  const [gnfOperator, setGnfOperator] = useState<'Orange Money Guinée' | 'MTN MoMo Guinée' | 'PayCard Guinée' | 'Vista Bank / Ecobank Conakry'>('Orange Money Guinée');
  const [gnfPhone, setGnfPhone] = useState('620 12 34 56');

  // GNF Conversion (1 EUR ≈ 9 350 GNF)
  const totalInGnf = Math.round(cartTotal * 9350);
  const formattedGnf = new Intl.NumberFormat('fr-FR').format(totalInGnf) + ' FG';

  // AI Fraud Check state
  const [fraudData, setFraudData] = useState<{
    riskScore: number;
    riskTier: string;
    status: string;
    factors: string[];
    algorithm: string;
  } | null>(null);
  const [isEvaluatingFraud, setIsEvaluatingFraud] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Run real-time AI Fraud Check
    const checkFraud = async () => {
      setIsEvaluatingFraud(true);
      try {
        const res = await fetch('/api/ai/fraud-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderAmount: cartTotal,
            paymentMethod,
            shippingCity: selectedAddress?.city,
            itemCount: cart.length,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setFraudData(data);
        }
      } catch (err) {
        console.warn('Fraud check fallback:', err);
      } finally {
        setIsEvaluatingFraud(false);
      }
    };

    checkFraud();
  }, [paymentMethod, cartTotal, selectedAddress?.city]);

  if (cart.length === 0) {
    setActiveView('cart');
    return null;
  }

  const handleCreateNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newPostalCode) return;

    const countryObj = ALL_SHIPPING_COUNTRIES.find((c) => c.name === newCountry) || ALL_SHIPPING_COUNTRIES[0];
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      name: `${user.name} (${newCountry.split(' ')[0]})`,
      street: newStreet,
      city: newCity,
      postalCode: newPostalCode || '000',
      country: newCountry,
      phone: newPhone || `${countryObj.dialCode} 600 00 00 00`,
    };
    setSelectedAddress(newAddr);
    setIsAddingAddress(false);
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Trigger festive confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const newOrder = createOrder({
        shippingAddress: selectedAddress,
        paymentMethod,
        carrier: selectedCarrier.name,
        paymentDetails: {
          brand: paymentMethod === 'card'
            ? 'Visa Premier'
            : paymentMethod === 'gnf_mobile'
            ? gnfOperator
            : paymentMethod === 'mobile_money'
            ? mobileOperator
            : 'PayPal',
          last4: paymentMethod === 'gnf_mobile' ? gnfPhone.slice(-4) : '4242',
          transactionId: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
        },
      });

      setSelectedOrderId(newOrder.id);
      setIsProcessing(false);
      setActiveView('order-success');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Checkout Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Validation de commande & Paiement sécurisé
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Connexion chiffrée SSL / TLS 1.3 • Certifié PCI-DSS Level 1
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Adresse de livraison
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingAddress ? 'Annuler' : 'Ajouter une adresse'}
              </button>
            </div>

            {/* Address Selector */}
            {!isAddingAddress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      selectedAddress.id === addr.id
                        ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{addr.name}</span>
                        {selectedAddress.id === addr.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{addr.street}</p>
                      <p className="text-xs text-slate-600">
                        {addr.postalCode} {addr.city}, {addr.country}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">{addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCreateNewAddress} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Nouvelle adresse de livraison</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pays de destination (54 Pays d'Afrique & International) :
                    </label>
                    <select
                      value={newCountry}
                      onChange={(e) => {
                        const selectedC = e.target.value;
                        setNewCountry(selectedC);
                        const cData = ALL_SHIPPING_COUNTRIES.find((c) => c.name === selectedC);
                        if (cData) {
                          setNewPhone(`${cData.dialCode} `);
                        }
                      }}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500"
                    >
                      <optgroup label="🌍 Tous les Pays d'Afrique (54 Pays)">
                        {AFRICAN_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} ({c.dialCode}) — Devise : {c.currencySymbol}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌐 Autres Pays">
                        <option value="France">🇫🇷 France (+33)</option>
                        <option value="Belgique">🇧🇪 Belgique (+32)</option>
                        <option value="Suisse">🇨🇭 Suisse (+41)</option>
                        <option value="Canada">🇨🇦 Canada (+1)</option>
                        <option value="États-Unis">🇺🇸 États-Unis (+1)</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Rue, Quartier ou Commune :</label>
                    <input
                      type="text"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="Ex: Quartier Kipé, Conakry"
                      required
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Ville :</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Ex: Conakry / Dakar / Abidjan"
                      required
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Code Postal :</label>
                    <input
                      type="text"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="Ex: 69001"
                      required
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone de livraison :</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Ex: +33 6 12 34 56 78"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition"
                >
                  Enregistrer et utiliser cette adresse
                </button>
              </form>
            )}
          </div>

          {/* Step 2: Shipping Method / Carrier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Mode de livraison & Transporteur
            </h2>

            <div className="space-y-3">
              {carrierOptions.map((carrier) => (
                <div
                  key={carrier.name}
                  onClick={() => setSelectedCarrier(carrier)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                    selectedCarrier.name === carrier.name
                      ? 'border-amber-500 bg-amber-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className={`w-5 h-5 ${selectedCarrier.name === carrier.name ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{carrier.name}</span>
                        {carrier.badge && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            {carrier.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Livraison estimée sous {carrier.days} jour{carrier.days > 1 ? 's' : ''} ouvré{carrier.days > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-slate-900">
                    {carrier.price === 0 ? 'Gratuit' : `${carrier.price.toFixed(2)} €`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Moyen de paiement sécurisé
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5">
              {[
                { id: 'card', label: 'Carte Bancaire', icon: CreditCard, subtitle: 'Visa / MC / CB' },
                { id: 'gnf_mobile', label: 'Franc Guinéen (GNF)', icon: Smartphone, subtitle: 'Orange 🇬🇳 / MTN 🇬🇳', badge: 'Guinée 🇬🇳' },
                { id: 'mobile_money', label: 'Mobile Money UEMOA', icon: Smartphone, subtitle: 'Orange / Wave / MTN' },
                { id: 'paypal', label: 'PayPal', icon: ShieldCheck, subtitle: 'Protection acheteurs' },
                { id: 'cod', label: 'À la livraison', icon: Banknote, subtitle: 'Espèces transporteur' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {m.badge && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-black bg-red-100 text-red-700 px-1 rounded">
                        {m.badge}
                      </span>
                    )}
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`} />
                    <div>
                      <p className="font-bold text-xs text-slate-900 leading-tight">{m.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-form according to selected payment method */}
            {paymentMethod === 'card' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Coordonnées bancaires cryptées :</span>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded font-bold text-blue-800">VISA</span>
                    <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded font-bold text-rose-800">MASTERCARD</span>
                    <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded font-bold text-emerald-800">CB</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Numéro de carte :</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiration :</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Cryptogramme CVC :</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      maxLength={4}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Protocole 3DS :</label>
                    <div className="text-xs text-emerald-700 font-bold p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 3D-Secure v2 Actif
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Franc Guinéen (GNF / FG) dedicated payment method */}
            {paymentMethod === 'gnf_mobile' && (
              <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 p-4 rounded-xl border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇬🇳</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>Paiement en Franc Guinéen (GNF / FG)</span>
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Guinée Conakry
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Conversion automatique au taux officiel garanti (1 EUR = 9 350 FG)
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-amber-400 font-black text-sm px-3 py-1.5 rounded-xl shadow-sm text-right">
                    Montant : {formattedGnf}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Choisissez votre service de paiement en Guinée :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        name: 'Orange Money Guinée',
                        code: '*144#',
                        badge: 'Préféré Conakry (62X)',
                        color: 'border-orange-500 bg-orange-50/70',
                      },
                      {
                        name: 'MTN MoMo Guinée',
                        code: '*440#',
                        badge: 'MTN Areeba (66X)',
                        color: 'border-yellow-500 bg-yellow-50/70',
                      },
                      {
                        name: 'PayCard Guinée',
                        code: 'Wallet local',
                        badge: 'Carte & App locale',
                        color: 'border-emerald-500 bg-emerald-50/70',
                      },
                      {
                        name: 'Vista Bank / Ecobank Conakry',
                        code: 'Agences & DAB',
                        badge: 'Dépôt / Virement',
                        color: 'border-blue-500 bg-blue-50/70',
                      },
                    ].map((op) => (
                      <button
                        type="button"
                        key={op.name}
                        onClick={() => setGnfOperator(op.name as any)}
                        className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between ${
                          gnfOperator === op.name
                            ? `${op.color} shadow-sm ring-2 ring-amber-400`
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900">{op.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Code USSD : {op.code}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-white/90 border px-1.5 py-0.5 rounded shadow-xs">
                          {op.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Numéro de téléphone affilié (Guinée Conakry) :
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-amber-500 bg-white shadow-xs">
                    <span className="bg-slate-100 text-slate-800 font-bold px-3 py-2 text-xs border-r border-slate-300 flex items-center gap-1.5 select-none">
                      <span>🇬🇳</span>
                      <span>+224</span>
                    </span>
                    <input
                      type="tel"
                      value={gnfPhone}
                      onChange={(e) => setGnfPhone(e.target.value)}
                      placeholder="620 00 00 00"
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-xl text-[11px] text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Procédure de débit sécurisé :</span>
                  </div>
                  <p>
                    1. Une notification de prélèvement de <span className="font-bold text-slate-950">{formattedGnf}</span> sera envoyée au numéro <span className="font-mono font-bold text-slate-950">+224 {gnfPhone}</span>.
                  </p>
                  <p>
                    2. Validez le paiement en saisissant votre code PIN secret sur votre téléphone ({gnfOperator.includes('Orange') ? 'composez *144*4*4# ou ouvrez l\'app Orange Money' : 'composez *440# sur MTN'}).
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'mobile_money' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700">Opérateur Mobile Money :</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Orange Money', 'Wave', 'MTN MoMo'].map((op) => (
                    <button
                      type="button"
                      key={op}
                      onClick={() => setMobileOperator(op)}
                      className={`p-2 rounded-lg text-xs font-bold border transition ${
                        mobileOperator === op ? 'bg-amber-500 text-slate-950 border-amber-600 shadow' : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Numéro de téléphone affilié :</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Une notification push vous sera envoyée pour confirmer le prélèvement via votre code secret.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p>
                  Vous serez redirigé vers l'interface sécurisée PayPal pour finaliser votre commande en un clic avec la Protection des Achats.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                <Banknote className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p>
                  Réglez en espèces directement auprès du coursier Chronopost lors de la remise de votre colis contre code secret SMS.
                </p>
              </div>
            )}
          </div>

          {/* Step 4: Real-Time AI Fraud Prevention Score Box */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg border border-slate-700">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                    AuraShield™ Détection de Fraude en Temps Réel
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                      IA Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Analyse prédictive comportementale, vélocité de transaction et tokenisation
                  </p>
                </div>
              </div>

              {fraudData && (
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] text-slate-300">Score de Risque :</span>
                  <span className="text-xs font-black text-emerald-400">
                    {fraudData.riskScore} / 100 ({fraudData.riskTier})
                  </span>
                </div>
              )}
            </div>

            {fraudData?.factors && (
              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                {fraudData.factors.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Place Order Button (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
              Articles à expédier ({cart.length})
            </h3>

            {/* Mini cart items preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-2 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-slate-500">
                      Qté : {item.quantity} • {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price review */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles :</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison ({selectedCarrier.name}) :</span>
                <span>{selectedCarrier.price === 0 ? 'Gratuit' : formatPrice(selectedCarrier.price)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon {appliedCoupon} :</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 items-baseline">
                <span className="font-bold text-sm">Montant Total :</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Traitement sécurisé en cours...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirmer & Payer {formatPrice(cartTotal)}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              En passant votre commande, vous acceptez les Conditions Générales de Vente d'AuraMarket et confirmez avoir pris connaissance de la Notice Protection des Données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
