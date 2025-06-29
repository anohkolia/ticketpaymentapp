import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { CartItem, Purchase } from '../types';
import { formatPrice } from './price';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export const generateTicketPDF = async (
  items: CartItem[],
  customerInfo: CustomerInfo,
  total: number,
  purchases?: Purchase[]
): Promise<string> => {
  const doc = new jsPDF();
  let yPosition = 20;

  // En-tête
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('🎫 BILLETS D\'ÉVÉNEMENT', 105, yPosition, { align: 'center' });
  yPosition += 20;

  // Informations client
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Client', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${customerInfo.firstName} ${customerInfo.lastName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Email: ${customerInfo.email}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date d'achat: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
  yPosition += 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;

  // Détails des billets
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails des Billets', 20, yPosition);
  yPosition += 15;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const purchase = purchases ? purchases[i] : null;

    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Cadre pour chaque billet
    doc.setDrawColor(100, 100, 100);
    doc.rect(15, yPosition - 5, 180, 80);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`BILLET ${i + 1}`, 20, yPosition + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${item.name}`, 20, yPosition + 15);
    doc.text(`Quantité: ${item.quantity}`, 20, yPosition + 25);
    doc.text(`Prix unitaire: ${formatPrice(item.price)}`, 20, yPosition + 35);
    doc.text(`Sous-total: ${formatPrice(item.price * item.quantity)}`, 20, yPosition + 45);

    // QR Code si disponible
    if (purchase && purchase.qr_code) {
      try {
        // Le QR code est déjà en format data URL depuis la base de données
        doc.addImage(purchase.qr_code, 'PNG', 140, yPosition, 40, 40);
        doc.setFontSize(8);
        doc.text('Présentez ce QR code', 145, yPosition + 50);
        doc.text('à l\'entrée', 155, yPosition + 55);
      } catch (error) {
        console.warn('Erreur lors de l\'ajout du QR code:', error);
      }
    } else {
      // Générer un QR code de base si pas de purchase
      try {
        const qrData = JSON.stringify({
          customer: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          ticket: item.name,
          quantity: item.quantity,
          date: new Date().toISOString()
        });
        
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 120,
          margin: 1
        });
        
        doc.addImage(qrCodeDataUrl, 'PNG', 140, yPosition, 40, 40);
        doc.setFontSize(8);
        doc.text('Présentez ce QR code', 145, yPosition + 50);
        doc.text('à l\'entrée', 155, yPosition + 55);
      } catch (error) {
        console.warn('Erreur lors de la génération du QR code:', error);
      }
    }

    yPosition += 90;
  }

  // Total
  yPosition += 10;
  doc.setDrawColor(0, 0, 0);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${formatPrice(total)}`, 190, yPosition, { align: 'right' });
  yPosition += 20;

  // Pied de page
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci pour votre achat ! Conservez ce billet pour l\'événement.', 105, yPosition, { align: 'center' });
  yPosition += 7;
  doc.text('En cas de problème, contactez notre support client.', 105, yPosition, { align: 'center' });

  // Numéro de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} sur ${pageCount}`, 190, 285, { align: 'right' });
  }

  return doc.output('dataurlstring');
};