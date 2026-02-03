import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/services/order.service';

export const generateInvoice = (order: Order) => {
  const doc = new jsPDF();
  
  // Debug: Log the order data to see what we're receiving
  console.log('📄 Generating invoice for order:', order.orderNumber);
  console.log('Order data:', {
    subtotal: order.subtotal,
    tax: order.tax,
    shippingCost: order.shippingCost,
    total: order.total,
    items: order.items.map(item => ({
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal
    }))
  });
  
  // Helper function to format currency properly - ensures number conversion
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'Rs. 0.00';
    // Use Rs. instead of ₹ symbol to avoid font encoding issues in PDF
    return `Rs. ${numAmount.toFixed(2)}`;
  };
  
  // Helper to safely parse numbers
  const parseNumber = (value: number | string): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };
  
  // Page margins
  const leftMargin = 15;
  const rightMargin = 195;
  const pageWidth = 210;
  
  // Company Header - Left Side
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text('AuraXpress', leftMargin, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Premium E-commerce Platform', leftMargin, 27);
  doc.text('Email: support@auraxpress.com', leftMargin, 32);
  doc.text('Phone: +1 (555) 123-4567', leftMargin, 37);
  
  // Invoice Title - Right Side
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', rightMargin, 20, { align: 'right' });
  
  // Invoice Details - Right Side
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Invoice #: ${order.orderNumber}`, rightMargin, 30, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, rightMargin, 35, { align: 'right' });
  doc.text(`Status: ${order.status.toUpperCase()}`, rightMargin, 40, { align: 'right' });
  
  // Divider Line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, 48, rightMargin, 48);
  
  // Billing Information Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('BILL TO:', leftMargin, 58);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(order.shippingFullName, leftMargin, 65);
  doc.text(order.shippingEmail, leftMargin, 71);
  doc.text(order.shippingPhone, leftMargin, 77);
  
  // Address with proper wrapping
  const addressLines = doc.splitTextToSize(order.shippingAddress, 80);
  let addressY = 83;
  addressLines.forEach((line: string) => {
    doc.text(line, leftMargin, addressY);
    addressY += 5;
  });
  doc.text(`${order.shippingCity}, ${order.shippingState} ${order.shippingZipCode}`, leftMargin, addressY);
  doc.text(order.shippingCountry, leftMargin, addressY + 5);
  
  // Payment Information - Right Side
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PAYMENT DETAILS:', 120, 58);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Method: ${order.paymentMethod.toUpperCase()}`, 120, 65);
  doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, 120, 71);
  
  // Order Items Table
  const tableData = order.items.map(item => {
    const price = parseNumber(item.price);
    const subtotal = parseNumber(item.subtotal);
    
    console.log(`Item: ${item.productName}, Price: ${price}, Qty: ${item.quantity}, Subtotal: ${subtotal}`);
    
    return [
      item.productName,
      item.quantity.toString(),
      formatCurrency(price),
      formatCurrency(subtotal)
    ];
  });
  
  console.log('Table data formatted:', tableData);
  
  autoTable(doc, {
    startY: 110,
    head: [['Product', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { cellWidth: 85, halign: 'left' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 37, halign: 'right' },
      3: { cellWidth: 38, halign: 'right' }
    },
    margin: { left: leftMargin, right: leftMargin },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    tableWidth: 'auto'
  });
  
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 110;
  
  // Summary Section - Right Aligned
  const summaryStartY = finalY + 15;
  const labelX = 130;
  const valueX = rightMargin;
  
  // Parse all amounts to ensure they're numbers
  const subtotal = parseNumber(order.subtotal);
  const shippingCost = parseNumber(order.shippingCost);
  const tax = parseNumber(order.tax);
  const total = parseNumber(order.total);
  
  // Summary box background
  doc.setFillColor(250, 250, 250);
  doc.rect(125, summaryStartY - 5, 70, 40, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  // Subtotal
  doc.text('Subtotal:', labelX, summaryStartY);
  doc.text(formatCurrency(subtotal), valueX, summaryStartY, { align: 'right' });
  
  // Shipping
  doc.text('Shipping:', labelX, summaryStartY + 7);
  doc.text(
    shippingCost === 0 ? 'Free' : formatCurrency(shippingCost),
    valueX,
    summaryStartY + 7,
    { align: 'right' }
  );
  
  // Tax
  doc.text('Tax (GST):', labelX, summaryStartY + 14);
  doc.text(formatCurrency(tax), valueX, summaryStartY + 14, { align: 'right' });
  
  // Divider line before total
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(labelX, summaryStartY + 19, valueX, summaryStartY + 19);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', labelX, summaryStartY + 27);
  doc.text(formatCurrency(total), valueX, summaryStartY + 27, { align: 'right' });
  
  // Terms and Conditions
  const termsY = summaryStartY + 45;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Terms & Conditions:', leftMargin, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('• All sales are final unless the product is defective.', leftMargin, termsY + 5);
  doc.text('• Refunds will be processed within 5-7 business days.', leftMargin, termsY + 10);
  doc.text('• For returns and exchanges, please contact customer support.', leftMargin, termsY + 15);
  
  // Footer
  const footerY = 275;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, footerY - 5, rightMargin, footerY - 5);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for shopping with AuraXpress!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('For any queries, please contact support@auraxpress.com', pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Save the PDF
  doc.save(`Invoice-${order.orderNumber}.pdf`);
};
