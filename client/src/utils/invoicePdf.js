import { jsPDF } from 'jspdf';

const COMPANY_NAME = 'Rastogi Codeworks';
const COMPANY_TAGLINE = 'Where Code Meets Experience';
const CURRENCY = 'Rs.';

/**
 * Load image from URL and return as base64 data URL for use in jsPDF.
 */
function loadImageAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = url;
  });
}

/**
 * Generate a professional invoice PDF with company logo and all invoice details.
 */
export async function generateInvoicePdf({
  clientName,
  billingAddress = '',
  invoiceDate,
  dueDate,
  items = [],
  notes = '',
  totals = { subtotal: 0, total: 0 },
  invoiceId = `INV-${Date.now().toString().slice(-6)}`,
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - 2 * margin;
  let y = margin;

  // ----- Header: Logo + Company (left) | Invoice title + meta (right) -----
  const headerY = y;

  // Left: Logo (load once for header + footer)
  let logoDataUrl = null;
  try {
    const logoUrl = `${window.location.origin}/transparent_logo.png`;
    logoDataUrl = await loadImageAsDataUrl(logoUrl);
    const logoSize = 24;
    doc.addImage(logoDataUrl, 'PNG', margin, headerY, logoSize, logoSize);
  } catch {
    doc.setFillColor(22, 163, 74);
    doc.rect(margin, headerY, 24, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('RC', margin + 12, headerY + 14, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  // Left: Company name and tagline below logo
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(5, 46, 22);
  doc.text(COMPANY_NAME, margin + 28, headerY + 8);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(COMPANY_TAGLINE, margin + 28, headerY + 14);

  // Right: INVOICE title + Invoice No., Issued, Due
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(5, 46, 22);
  doc.text('INVOICE', pageW - margin, headerY + 6, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No.  #${invoiceId}`, pageW - margin, headerY + 14, { align: 'right' });
  doc.text('Issued  ' + (invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'), pageW - margin, headerY + 20, { align: 'right' });
  doc.text('Due  ' + (dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'), pageW - margin, headerY + 26, { align: 'right' });

  y = headerY + 32;

  // ----- Divider -----
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 14;

  // ----- Bill To -----
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Bill To', margin, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text(clientName || 'Client Name', margin, y);
  y += 6;
  if (billingAddress && String(billingAddress).trim()) {
    const addressLines = doc.splitTextToSize(String(billingAddress).trim(), contentW);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 5 + 4;
  } else {
    y += 6;
  }
  y += 6;

  // ----- Line items table -----
  const colDesc = margin;
  const colQty = margin + 95;
  const colPrice = margin + 115;
  const colAmount = pageW - margin;
  const tableRowH = 9;
  const headerH = 10;

  // Table header row (light green background + border)
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, y, contentW, headerH, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  doc.line(margin, y + headerH, pageW - margin, y + headerH);
  doc.line(margin, y, margin, y + headerH);
  doc.line(colQty, y, colQty, y + headerH);
  doc.line(colPrice, y, colPrice, y + headerH);
  doc.line(colAmount, y, colAmount, y + headerH);

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('Description', colDesc + 3, y + 6.5);
  doc.text('Qty', colQty + 4, y + 6.5);
  doc.text('Unit Price', colPrice + 2, y + 6.5);
  doc.text('Amount', colAmount - 2, y + 6.5, { align: 'right' });
  y += headerH;

  const lineItems = items.filter((i) => i.description || Number(i.quantity) || Number(i.price));
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);

  if (lineItems.length === 0) {
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentW, tableRowH, 'S');
    doc.text('No line items', colDesc + 3, y + 5.5);
    doc.text('-', colAmount - 2, y + 5.5, { align: 'right' });
    y += tableRowH;
  } else {
    lineItems.forEach((item) => {
      if (y > pageH - 60) {
        doc.addPage();
        y = 20;
      }
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const amount = qty * price;

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, pageW - margin, y);
      doc.setFontSize(9);
      doc.text((item.description || '—').substring(0, 48), colDesc + 3, y + 5.5);
      doc.text(String(qty), colQty + 4, y + 5.5);
      doc.text(`${CURRENCY} ${price.toFixed(2)}`, colPrice + 2, y + 5.5);
      doc.text(`${CURRENCY} ${amount.toFixed(2)}`, colAmount - 2, y + 5.5, { align: 'right' });
      y += tableRowH;
    });
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
  }

  y += 12;

  // ----- Totals (right-aligned, box) -----
  const totalsBoxW = 56;
  const totalsBoxX = colAmount - totalsBoxW;
  const totalsLabelX = totalsBoxX + 2;
  const totalsValueX = colAmount - 2;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal', totalsLabelX, y);
  doc.text(`${CURRENCY} ${(totals.subtotal ?? 0).toFixed(2)}`, totalsValueX, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsBoxX, y, colAmount, y);
  y += 8;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 46, 22);
  doc.text('Total', totalsLabelX, y);
  doc.text(`${CURRENCY} ${(totals.total ?? 0).toFixed(2)}`, totalsValueX, y, { align: 'right' });
  y += 16;

  // ----- Notes / Terms -----
  if (notes && notes.trim()) {
    if (y > pageH - 50) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentW, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentW, 28, 'S');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Notes / Terms', margin + 4, y + 7);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(notes.trim(), contentW - 8);
    doc.text(splitNotes, margin + 4, y + 14);
    y += 34;
  }

  // ----- Footer: logo + thank you message -----
  const footerY = pageH - 18;
  const footerLogoSize = 10;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', pageW / 2 - footerLogoSize / 2, footerY, footerLogoSize, footerLogoSize);
  }
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${COMPANY_NAME} • Thank you for your business.`,
    pageW / 2,
    pageH - 6,
    { align: 'center' }
  );

  return doc;
}

/**
 * Generate PDF and trigger download.
 */
export async function downloadInvoicePdf(options) {
  const doc = await generateInvoicePdf(options);
  const clientSlug = (options.clientName || 'Invoice').replace(/[^a-z0-9]/gi, '-').slice(0, 30);
  const dateStr = options.invoiceDate ? options.invoiceDate.replace(/-/g, '') : 'draft';
  doc.save(`Invoice-${clientSlug}-${dateStr}.pdf`);
}
