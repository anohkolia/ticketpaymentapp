import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { CartItem } from '../types';
import { formatPrice } from './price';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export const generateTicketPDF = async (
  items: CartItem[],
  customerInfo: CustomerInfo,
  total: number
): Promise<string> => {
  const doc = new jsPDF();

  // Generate QR code
  const qrData = JSON.stringify({
    name: `${customerInfo.firstName} ${customerInfo.lastName}`,
    email: customerInfo.email,
    orderId: Date.now().toString()
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrData);

  // Header
  doc.setFontSize(20);
  doc.text('Event Ticket', 105, 20, { align: 'center' });

  // Customer Information
  doc.setFontSize(14);
  doc.text('Customer Information', 20, 40);
  doc.setFontSize(12);
  doc.text(`Name: ${customerInfo.firstName} ${customerInfo.lastName}`, 20, 50);
  doc.text(`Email: ${customerInfo.email}`, 20, 60);

  // Ticket Details
  doc.setFontSize(14);
  doc.text('Ticket Details', 20, 80);

  let yPosition = 90;
  items.forEach(item => {
    doc.setFontSize(12);
    doc.text(`${item.name}`, 20, yPosition);
    doc.text(`Quantity: ${item.quantity}`, 20, yPosition + 7);
    doc.text(`Price per ticket: ${formatPrice(item.price)}`, 20, yPosition + 14);
    doc.text(`Subtotal: ${formatPrice(item.price * item.quantity)}`, 20, yPosition + 21);
    yPosition += 35;
  });

  // Total
  doc.setFontSize(14);
  doc.text(`Total Amount: ${formatPrice(total)}`, 190, yPosition, { align: 'right' });

  // QR Code
  const img = new Image();
  img.src = qrCodeDataUrl;
  doc.addImage(qrCodeDataUrl, 'PNG', 80, yPosition + 20, 50, 50);

  // Footer
  doc.setFontSize(10);
  doc.text('Please present this ticket at the event entrance.', 105, yPosition + 80, { align: 'center' });

  return doc.output('dataurlstring');
};
