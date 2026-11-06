import { jsPDF } from 'jspdf';
import { Order } from '../types';

export const generateInvoicePdf = (
  order: Order,
  formatPrice?: (n: number) => string
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const amberColor: [number, number, number] = [217, 119, 6]; // amber-600
  const grayColor: [number, number, number] = [100, 116, 139]; // slate-500
  const lightBg: [number, number, number] = [248, 250, 252]; // slate-50

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 36, 'F');

  // Logo Brand Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('aura', 14, 18);

  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('market', 30, 18);

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.text('Plateforme E-Commerce & Marketplace Internationale (Europe & Afrique)', 14, 25);
  doc.text('Conformité OHADA, CEDEAO & Union Européenne', 14, 30);

  // Invoice Title on Top Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FACTURE ACQUITTÉE', 196, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(251, 191, 36);
  doc.text(`N° ${order.orderNumber}`, 196, 25, { align: 'right' });
  doc.setTextColor(203, 213, 225);
  doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 196, 30, { align: 'right' });

  // 2. Buyer and Seller details block
  let currentY = 46;

  // Seller box (Left)
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, currentY, 86, 40, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 86, 40, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('ÉMETTEUR / PLATEFORME', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('AuraMarket International Services Ltd', 18, currentY + 13);
  doc.text('Hub Logistique & Centre d\'Arbitrage', 18, currentY + 18);
  doc.text('N° TVA / SIREN : FR 89 2026 894 100', 18, currentY + 23);
  doc.text('Support : support@auramarket.com', 18, currentY + 28);
  doc.text(`Vendeur : ${order.items[0]?.product.sellerName || 'Partenaire Marketplace Certifié'}`, 18, currentY + 33);

  // Buyer box (Right)
  doc.setFillColor(...lightBg);
  doc.roundedRect(110, currentY, 86, 40, 2, 2, 'F');
  doc.roundedRect(110, currentY, 86, 40, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('DESTINATAIRE / ACHETEUR', 114, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Nom : ${order.shippingAddress.name}`, 114, currentY + 13);
  doc.text(`Adresse : ${order.shippingAddress.street}`, 114, currentY + 18);
  doc.text(`Ville : ${order.shippingAddress.postalCode} ${order.shippingAddress.city}`, 114, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pays : ${order.shippingAddress.country || 'Guinée'}`, 114, currentY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(`Téléphone : ${order.shippingAddress.phone}`, 114, currentY + 33);

  // 3. Payment & Logistics meta
  currentY += 46;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(14, currentY, 182, 16, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(14, currentY, 182, 16, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 53, 15); // amber-900
  doc.text('PAIEMENT & SUIVI LOGISTIQUE :', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  const paymentMethodLabel =
    order.paymentMethod === 'gnf_mobile'
      ? `Franc Guinéen (${order.paymentDetails?.brand || 'Orange/MTN Guinée'})`
      : order.paymentMethod === 'card'
      ? `Carte Bancaire (3D-Secure) [${order.paymentDetails?.last4 ? '•••• ' + order.paymentDetails.last4 : 'Validé'}]`
      : order.paymentMethod === 'mobile_money'
      ? `Mobile Money UEMOA (${order.paymentDetails?.brand || 'Opérateur Mobile'})`
      : order.paymentMethod === 'paypal'
      ? 'PayPal Express Checkout'
      : 'Paiement à la livraison';

  doc.text(`Règlement : ${paymentMethodLabel}  •  Transaction ID : ${order.paymentDetails?.transactionId || 'TXN-9982410'}`, 18, currentY + 11);
  doc.text(`Transporteur : ${order.carrier}  •  N° de Suivi : ${order.trackingNumber}`, 110, currentY + 11);

  // 4. Products Table
  currentY += 24;

  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(14, currentY, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DÉSIGNATION DU PRODUIT', 18, currentY + 5.5);
  doc.text('RÉF / SKU', 105, currentY + 5.5);
  doc.text('QTÉ', 135, currentY + 5.5, { align: 'center' });
  doc.text('P.U. HT', 160, currentY + 5.5, { align: 'right' });
  doc.text('TOTAL HT', 192, currentY + 5.5, { align: 'right' });

  currentY += 8;

  // Table Rows
  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 10, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 10, 196, currentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    // Product Title (truncated to fit)
    const truncatedName = item.product.name.length > 50
      ? item.product.name.substring(0, 48) + '...'
      : item.product.name;

    doc.text(truncatedName, 18, currentY + 6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.product.sku || 'AURA-SKU', 105, currentY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity), 135, currentY + 6.5, { align: 'center' });

    const unitPriceHT = (item.product.price * 0.8333).toFixed(2) + ' €';
    const totalRowHT = (item.product.price * item.quantity * 0.8333).toFixed(2) + ' €';

    doc.text(unitPriceHT, 160, currentY + 6.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(totalRowHT, 192, currentY + 6.5, { align: 'right' });

    currentY += 10;
  });

  // 5. Totals Breakdown Card
  currentY += 6;
  const totalsBoxX = 110;
  const totalsBoxWidth = 86;

  doc.setFillColor(...lightBg);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, 44, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, 44, 2, 2, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let totalLineY = currentY + 7;
  doc.text('Sous-total HT :', totalsBoxX + 4, totalLineY);
  doc.text(`${(order.subtotal * 0.8333).toFixed(2)} €`, totalsBoxX + totalsBoxWidth - 4, totalLineY, { align: 'right' });

  totalLineY += 6;
  doc.text('Frais de port / Livraison :', totalsBoxX + 4, totalLineY);
  doc.text(order.shippingFee === 0 ? 'Offert (Gratuit)' : `${order.shippingFee.toFixed(2)} €`, totalsBoxX + totalsBoxWidth - 4, totalLineY, { align: 'right' });

  if (order.discountAmount > 0) {
    totalLineY += 6;
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`Remise Coupon (${order.couponCode || 'PROMO'}) :`, totalsBoxX + 4, totalLineY);
    doc.text(`-${order.discountAmount.toFixed(2)} €`, totalsBoxX + totalsBoxWidth - 4, totalLineY, { align: 'right' });
    doc.setTextColor(71, 85, 105);
  }

  totalLineY += 6;
  doc.text('TVA (20% applicable) :', totalsBoxX + 4, totalLineY);
  doc.text(`${(order.subtotal * 0.1667).toFixed(2)} €`, totalsBoxX + totalsBoxWidth - 4, totalLineY, { align: 'right' });

  // Total TTC highlight
  totalLineY += 8;
  doc.setFillColor(...primaryColor);
  doc.rect(totalsBoxX, totalLineY - 5, totalsBoxWidth, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC RÉGLÉ :', totalsBoxX + 4, totalLineY + 2);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text(`${order.totalAmount.toFixed(2)} €`, totalsBoxX + totalsBoxWidth - 4, totalLineY + 2, { align: 'right' });

  // Guinean Francs equivalent conversion if applicable
  const gnfEquivalent = Math.round(order.totalAmount * 9350);
  const formattedGnfEq = new Intl.NumberFormat('fr-FR').format(gnfEquivalent) + ' FG';

  // Left Note / Guaranteed Stamp Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.roundedRect(14, currentY, 90, 44, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(14, currentY, 90, 44, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('CERTIFICAT D\'AUTHENTICITÉ ET GARANTIE', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('• Transaction certifiée conforme PCI-DSS & 3D-Secure', 18, currentY + 14);
  doc.text('• Droit de rétractation de 30 jours à compter de la réception', 18, currentY + 20);
  doc.text('• Couverture logistique intégrale en Afrique et en Europe', 18, currentY + 26);
  doc.setFont('helvetica', 'bold');
  doc.text(`• Équivalent Franc Guinéen : ${formattedGnfEq}`, 18, currentY + 34);

  // 6. Bottom Legal Footer
  const footerY = 278;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('AuraMarket Inc. – Plateforme Marketplace Multi-Vendeurs – Siège : 42 Avenue des Champs-Élysées, 75008 Paris.', 105, footerY + 5, { align: 'center' });
  doc.text('Facture établie sous forme électronique conformément à l\'article 289-VII du CGI et aux directives de l\'OHADA. Document valant reçu de paiement.', 105, footerY + 9, { align: 'center' });

  // Auto trigger download
  doc.save(`Facture_AuraMarket_${order.orderNumber.replace(/[^a-zA-Z0-9-]/g, '')}.pdf`);

  return doc;
};
