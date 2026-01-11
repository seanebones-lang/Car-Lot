import jsPDF from 'jspdf';
import { getDatabase } from '../database';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

/**
 * Generates a PDF invoice for a sale
 */
export async function generateInvoice(saleId: number): Promise<string> {
  const db = getDatabase();
  
  // Get sale data with related information
  const sale = db.prepare(`
    SELECT s.*, c.make, c.model, c.year as carYear, c.vin,
           cus.name as customerName, cus.email as customerEmail, 
           cus.phone as customerPhone, cus.address as customerAddress
    FROM sales s
    JOIN cars c ON s.carId = c.id
    JOIN customers cus ON s.customerId = cus.id
    WHERE s.id = ?
  `).get(saleId) as any;
  
  if (!sale) {
    throw new Error('Sale not found');
  }
  
  // Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: INV-${saleId.toString().padStart(6, '0')}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 15;
  
  // Company Info (placeholder - should come from settings)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AutoLot Pro', margin, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Car Dealership', margin, yPos);
  yPos += 20;
  
  // Customer Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Bill To:', margin, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(sale.customerName || 'N/A', margin, yPos);
  yPos += 5;
  if (sale.customerAddress) {
    doc.text(sale.customerAddress, margin, yPos);
    yPos += 5;
  }
  if (sale.customerEmail) {
    doc.text(sale.customerEmail, margin, yPos);
    yPos += 5;
  }
  if (sale.customerPhone) {
    doc.text(sale.customerPhone, margin, yPos);
    yPos += 5;
  }
  yPos += 10;
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Vehicle Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Vehicle Details', margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Make/Model: ${sale.make} ${sale.model}`, margin, yPos);
  yPos += 5;
  doc.text(`Year: ${sale.carYear}`, margin, yPos);
  yPos += 5;
  if (sale.vin) {
    doc.text(`VIN: ${sale.vin}`, margin, yPos);
    yPos += 5;
  }
  yPos += 10;
  
  // Line separator
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Pricing Table
  const tableStartY = yPos;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description', margin, yPos);
  doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
  yPos += 7;
  
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Vehicle Price`, margin, yPos);
  doc.text(`$${sale.price.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 7;
  
  if (sale.tax && sale.tax > 0) {
    doc.text(`Tax`, margin, yPos);
    doc.text(`$${sale.tax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;
  }
  
  yPos += 3;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  const total = sale.price + (sale.tax || 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total', margin, yPos);
  doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 15;
  
  // Financing Information
  if (sale.financing) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Financing: ${sale.financing}`, margin, yPos);
    yPos += 10;
  }
  
  // Notes
  if (sale.notes) {
    yPos += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(`Notes: ${sale.notes}`, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  // Save PDF to invoices directory
  const userDataPath = app.getPath('userData');
  const invoicesDir = path.join(userDataPath, 'invoices');
  
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  
  const invoiceFilename = `invoice-${saleId}-${Date.now()}.pdf`;
  const invoicePath = path.join(invoicesDir, invoiceFilename);
  
  doc.save(invoicePath);
  
  // Update sale record with invoice path
  db.prepare('UPDATE sales SET invoicePath = ? WHERE id = ?').run(invoicePath, saleId);
  
  return invoicePath;
}
