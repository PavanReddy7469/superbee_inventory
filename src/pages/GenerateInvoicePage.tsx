import { useState, useEffect } from 'react';
import { FileText, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/superbee.png';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  gst: number;
}

interface InvoiceData {
  id: string;
  type: 'Invoice';
  invoiceNumber: string;
  date: string;
  time: string;
  location: string;
  billTo: string;
  address: string;
  gstin: string;
  state: string;
  items: InvoiceItem[];
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  notes: string;
  status: string;
}

export default function GenerateInvoicePage() {
  const [location, setLocation] = useState<'Andhra Pradesh' | 'Bhubaneswar'>('Andhra Pradesh');
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceData[]>([]);
  const [formData, setFormData] = useState({
    billTo: '',
    address: '',
    gstin: '',
    state: '',
    bankName: 'AXIS BANK',
    accountNumber: '924020008065248',
    ifscCode: 'UTIB0003240',
    notes: 'Thanks for doing business with us!'
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, gst: 18 }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('invoiceHistory');
    if (saved) {
      setInvoiceHistory(JSON.parse(saved));
    }
  }, []);

  const getNextInvoiceNumber = () => {
    const allRecords = [...invoiceHistory];
    const savedAO = localStorage.getItem('aoHistory');
    if (savedAO) {
      allRecords.push(...JSON.parse(savedAO));
    }
    
    if (allRecords.length === 0) {
      return 'SAPL/25-26/0001';
    }
    
    const lastNumber = allRecords
      .map(r => parseInt(r.invoiceNumber.split('/')[2]))
      .sort((a, b) => b - a)[0];
    
    const nextNum = (lastNumber + 1).toString().padStart(4, '0');
    return `SAPL/25-26/${nextNum}`;
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, gst: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const gstAmount = (subtotal * item.gst) / 100;
    return subtotal + gstAmount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const gstTotal = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gst) / 100), 0);
    const total = subtotal + gstTotal;
    return { subtotal, gstTotal, total };
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const generatePDF = () => {
    try {
      console.log('Starting Invoice PDF generation...');
      const doc = new jsPDF();
      const invoiceNumber = getNextInvoiceNumber();
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-GB').replace(/\//g, '-');
      const timeStr = currentDate.toLocaleTimeString('en-IN');

      // Calculate totals first
      const totals = calculateTotals();
      const gstRate = items[0]?.gst || 18;
      const halfGstRate = gstRate / 2;

      // Header - Company Name
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUPERBEE AERONAUTICS PVT. LTD', 20, 18);
      
      // Add logo
      try {
        doc.addImage(logo, 'PNG', 165, 10, 30, 30);
      } catch (error) {
        console.error('Error adding logo:', error);
      }
      
      // Company details
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Supplier of Drone Components /Simulators /Sensors. C/o Centurion', 20, 23);
      if (location === 'Bhubaneswar') {
        doc.text('University of Technology and Management Survey No. 10 + 10 &', 20, 27);
        doc.text('Techno Village, Jatni, Khurda, Bhubaneswar, Odisha 752050', 20, 31);
        doc.text('GSTIN: 21AAKCS0752B1Z8', 20, 35);
        doc.setTextColor(0, 0, 255);
        doc.text('State: 21-Odisha', 20, 39);
      } else {
        doc.text('University of Technology and Management Survey NO: 157-1 TO 6,', 20, 27);
        doc.text('Tekkali Village, Nellimarla, 535 003, Andhra Pradesh 535003', 20, 31);
        doc.text('GSTIN: 21AAKCS0752B1Z8', 20, 35);
        doc.setTextColor(0, 0, 255);
        doc.text('State: 36-Telangana', 20, 39);
      }
      doc.setTextColor(0, 0, 0);

      // Horizontal line after header
      doc.setLineWidth(0.3);
      doc.line(20, 43, 190, 43);

      // Tax Invoice Title (centered)
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(138, 126, 238); // Purple color
      doc.text('Tax Invoice', 105, 51, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      // Horizontal line after title
      doc.setLineWidth(0.3);
      doc.line(20, 55, 190, 55);

      // Bill To section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To', 20, 63);
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.billTo.toUpperCase(), 20, 68);
      
      doc.setFont('helvetica', 'normal');
      const addressLines = doc.splitTextToSize(formData.address, 80);
      let yPos = 72;
      addressLines.forEach((line: string) => {
        doc.text(line, 20, yPos);
        yPos += 3.5;
      });
      
      doc.text(`State: ${formData.state}`, 20, yPos);
      doc.setTextColor(0, 0, 255);
      doc.text(`GSTIN/UIN: ${formData.gstin}`, 20, yPos + 4);
      doc.setTextColor(0, 0, 0);

      // Invoice Details (right side)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Details', 130, 63);
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No : ${invoiceNumber}`, 130, 68);
      doc.text(`Date : ${dateStr}`, 130, 72);
      doc.text(`Place of supply: ${formData.state}`, 130, 76);

      // Items Table
      const tableData: any[] = items.map((item, index) => {
        const subtotal = item.quantity * item.unitPrice;
        const gstAmount = (subtotal * item.gst) / 100;
        return [
          index + 1,
          item.description,
          item.quantity,
          `₹ ${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹ ${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n(${item.gst}%)`,
          `₹ ${calculateItemTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        ];
      });

      // Add Total row
      const subtotalSum = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      tableData.push([
        { content: 'Total', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        `₹ ${subtotalSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹ ${totals.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹ ${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: yPos + 12,
        head: [[
          { content: '#', styles: { halign: 'center', fillColor: [138, 126, 238] } },
          { content: 'Item name', styles: { fillColor: [138, 126, 238] } },
          { content: 'Quantity', styles: { halign: 'center', fillColor: [138, 126, 238] } },
          { content: 'Price/ Unit', styles: { halign: 'right', fillColor: [138, 126, 238] } },
          { content: 'Sub Total', styles: { halign: 'right', fillColor: [138, 126, 238] } },
          { content: 'GST', styles: { halign: 'center', fillColor: [138, 126, 238] } },
          { content: 'Amount', styles: { halign: 'right', fillColor: [138, 126, 238] } }
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [138, 126, 238],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 65 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'right', cellWidth: 25 }
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        didParseCell: function(data) {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      // Get final Y position after table
      const finalY = (doc as any).lastAutoTable?.finalY || 160;

      // Description section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 20, finalY + 6);
      
      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text('SUPERBEE AERONAUTICS PVT.LTD', 20, finalY + 11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Account Number: ${formData.accountNumber}`, 20, finalY + 15);
      doc.text(`Bank Name: ${formData.bankName}`, 20, finalY + 19);
      doc.text(`Ifsc code: ${formData.ifscCode}`, 20, finalY + 23);

      // Totals on right side
      const rightX = 130;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Sub Total', rightX, finalY + 6);
      doc.text(`₹ ${totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 6, { align: 'right' });
      
      doc.text(`SGST@${halfGstRate}%`, rightX, finalY + 10);
      doc.text(`₹ ${(totals.gstTotal / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 10, { align: 'right' });
      
      doc.text(`CGST@${halfGstRate}%`, rightX, finalY + 14);
      doc.text(`₹ ${(totals.gstTotal / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 14, { align: 'right' });

      // Total with purple background
      doc.setFillColor(138, 126, 238);
      doc.rect(rightX - 2, finalY + 17, 62, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Total', rightX, finalY + 20.5);
      doc.text(`₹ ${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 20.5, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      // Invoice Amount in Words
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Amount In Words', 20, finalY + 30);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 140, 0);
      const amountInWords = numberToWords(Math.floor(totals.total)) + ' Rupees only';
      doc.text(amountInWords, 20, finalY + 35);
      doc.setTextColor(0, 0, 0);

      // Terms and Conditions
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms and Conditions', 20, finalY + 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(formData.notes || 'Thanks for doing business with us!', 20, finalY + 47);

      // Save PDF
      console.log('Saving Invoice PDF...');
      doc.save(`Invoice_${invoiceNumber}_${dateStr}.pdf`);
      console.log('Invoice PDF saved successfully!');

      // Save to history
      const newInvoice: InvoiceData = {
        id: Date.now().toString(),
        type: 'Invoice',
        invoiceNumber,
        date: dateStr,
        time: timeStr,
        location,
        billTo: formData.billTo,
        address: formData.address,
        gstin: formData.gstin,
        state: formData.state,
        items,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        notes: formData.notes,
        status: 'Generated'
      };

      const updatedHistory = [...invoiceHistory, newInvoice];
      setInvoiceHistory(updatedHistory);
      localStorage.setItem('invoiceHistory', JSON.stringify(updatedHistory));
      console.log('Invoice saved to history');

      // Reset form
      setFormData({
        billTo: '',
        address: '',
        gstin: '',
        state: '',
        bankName: 'AXIS BANK',
        accountNumber: '924020008065248',
        ifscCode: 'UTIB0003240',
        notes: 'Thanks for doing business with us!'
      });
      setItems([{ description: '', quantity: 1, unitPrice: 0, gst: 18 }]);
      console.log('Form reset complete');
      alert('Invoice PDF generated successfully!');
    } catch (error) {
      console.error('Error generating Invoice PDF:', error);
      alert('Failed to generate Invoice PDF. Check console for details.');
    }
  };

  const deleteInvoice = (id: string) => {
    const updatedHistory = invoiceHistory.filter(inv => inv.id !== id);
    setInvoiceHistory(updatedHistory);
    localStorage.setItem('invoiceHistory', JSON.stringify(updatedHistory));
  };

  const downloadPDF = (invoice: InvoiceData) => {
    try {
      // Regenerate PDF from history
      const doc = new jsPDF();

      // Calculate totals first
      const totals = {
        subtotal: invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        gstTotal: invoice.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gst) / 100), 0),
        total: 0
      };
      totals.total = totals.subtotal + totals.gstTotal;

      const gstRate = invoice.items[0]?.gst || 18;
      const halfGstRate = gstRate / 2;

      // Header - Company Name
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUPERBEE AERONAUTICS PVT. LTD', 20, 18);
      
      // Add logo
      try {
        doc.addImage(logo, 'PNG', 165, 10, 30, 30);
      } catch (error) {
        console.error('Error adding logo:', error);
      }
      
      // Company details
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Supplier of Drone Components /Simulators /Sensors. C/o Centurion', 20, 23);
      doc.text('University of Technology and Management Survey NO: 157-1 TO 6,', 20, 27);
      doc.text('Tekkali Village, Nellimarla, 535 003, Andhra Pradesh 535003', 20, 31);
      doc.text('GSTIN: 21AAKCS0752B1Z8', 20, 35);
      doc.setTextColor(0, 0, 255);
      doc.text('State: 36-Telangana', 20, 39);
      doc.setTextColor(0, 0, 0);

      // Horizontal line
      doc.setLineWidth(0.3);
      doc.line(20, 43, 190, 43);

      // Tax Invoice Title
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(138, 126, 238);
      doc.text('Tax Invoice', 105, 51, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.line(20, 55, 190, 55);

      // Bill To section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To', 20, 63);
      doc.setFontSize(8.5);
      doc.text(invoice.billTo.toUpperCase(), 20, 68);
      
      doc.setFont('helvetica', 'normal');
      const addressLines = doc.splitTextToSize(invoice.address, 80);
      let yPos = 72;
      addressLines.forEach((line: string) => {
        doc.text(line, 20, yPos);
        yPos += 3.5;
      });
      
      doc.text(`State: ${invoice.state}`, 20, yPos);
      doc.setTextColor(0, 0, 255);
      doc.text(`GSTIN/UIN: ${invoice.gstin}`, 20, yPos + 4);
      doc.setTextColor(0, 0, 0);

      // Invoice Details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Details', 130, 63);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No : ${invoice.invoiceNumber}`, 130, 68);
      doc.text(`Date : ${invoice.date}`, 130, 72);
      doc.text(`Place of supply: ${invoice.state}`, 130, 76);

      // Items Table
      const tableData: any[] = invoice.items.map((item, index) => {
        const subtotal = item.quantity * item.unitPrice;
        const gstAmount = (subtotal * item.gst) / 100;
        return [
          index + 1,
          item.description,
          item.quantity,
          `₹ ${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹ ${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n(${item.gst}%)`,
          `₹ ${calculateItemTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        ];
      });

      tableData.push([
        { content: 'Total', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
        `₹ ${totals.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹ ${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: yPos + 8,
        head: [[
          { content: '#', styles: { halign: 'center', fillColor: [138, 126, 238], textColor: [255, 255, 255] } },
          { content: 'Item name', styles: { fillColor: [138, 126, 238], textColor: [255, 255, 255] } },
          { content: 'Quantity', styles: { halign: 'center', fillColor: [138, 126, 238], textColor: [255, 255, 255] } },
          { content: 'Price/ Unit', styles: { halign: 'right', fillColor: [138, 126, 238], textColor: [255, 255, 255] } },
          { content: 'GST', styles: { halign: 'right', fillColor: [138, 126, 238], textColor: [255, 255, 255] } },
          { content: 'Amount', styles: { halign: 'right', fillColor: [138, 126, 238], textColor: [255, 255, 255] } }
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [138, 126, 238],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [200, 200, 200],
          cellPadding: 2
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 75, overflow: 'linebreak' },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 28 },
          4: { halign: 'right', cellWidth: 28 },
          5: { halign: 'right', cellWidth: 29 }
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [200, 200, 200],
          overflow: 'linebreak'
        },
        didParseCell: function(data) {
          if (data.row.index === tableData.length - 1 && data.section === 'body') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [245, 245, 245];
          }
        }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 160;

      // Description section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 20, finalY + 6);
      
      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text('SUPERBEE AERONAUTICS PVT.LTD', 20, finalY + 11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Account Number: ${invoice.accountNumber}`, 20, finalY + 15);
      doc.text(`Bank Name: ${invoice.bankName}`, 20, finalY + 19);
      doc.text(`Ifsc code: ${invoice.ifscCode}`, 20, finalY + 23);

      // Totals
      const rightX = 130;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Sub Total', rightX, finalY + 6);
      doc.text(`₹ ${totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 6, { align: 'right' });
      
      doc.text(`SGST@${halfGstRate}%`, rightX, finalY + 10);
      doc.text(`₹ ${(totals.gstTotal / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 10, { align: 'right' });
      
      doc.text(`CGST@${halfGstRate}%`, rightX, finalY + 14);
      doc.text(`₹ ${(totals.gstTotal / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 14, { align: 'right' });

      // Total with purple background
      doc.setFillColor(138, 126, 238);
      doc.rect(rightX - 2, finalY + 17, 62, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Total', rightX, finalY + 20.5);
      doc.text(`₹ ${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, finalY + 20.5, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      // Invoice Amount in Words
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Amount In Words', 20, finalY + 30);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 140, 0);
      const amountInWords = numberToWords(Math.floor(totals.total)) + ' Rupees only';
      doc.text(amountInWords, 20, finalY + 35);
      doc.setTextColor(0, 0, 0);

      // Terms and Conditions
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms and Conditions', 20, finalY + 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.notes || 'Thanks for doing business with us!', 20, finalY + 47);

      doc.save(`Invoice_${invoice.invoiceNumber}_${invoice.date}.pdf`);
    } catch (error) {
      console.error('Error downloading Invoice PDF:', error);
      alert('Failed to download Invoice PDF.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Generate Invoice Request</h1>
          <p className="text-slate-600 mt-1">Create and manage invoice requests with PDF generation</p>
        </div>
      </div>

      {/* Location Dropdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as 'Andhra Pradesh' | 'Bhubaneswar')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Bhubaneswar">Bhubaneswar</option>
        </select>
      </div>

          {/* Invoice Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bill To (Customer/Institution) *
                </label>
                <input
                  type="text"
                  value={formData.billTo}
                  onChange={(e) => setFormData({ ...formData, billTo: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GSTIN *
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter GSTIN"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter state"
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <h3 className="text-md font-semibold text-slate-900 mb-3">Items</h3>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Item Description *
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter item description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="flex items-end">
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addItem}
              className="mb-6 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
            >
              + Add Item
            </button>

            {/* Bank Details */}
            <h3 className="text-md font-semibold text-slate-900 mb-3">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows={3}
                placeholder="Add any additional notes"
              />
            </div>

            {/* Totals Display */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-700">Subtotal:</span>
                <span className="font-semibold">₹ {calculateTotals().subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-700">GST:</span>
                <span className="font-semibold">₹ {calculateTotals().gstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-cyan-600">₹ {calculateTotals().total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={generatePDF}
              disabled={!formData.billTo || !formData.address || !formData.gstin || !formData.state || items.some(i => !i.description || !i.unitPrice)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-5 w-5" />
              <span>Generate Invoice PDF</span>
            </button>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice History</h2>
            {invoiceHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No invoices generated yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceHistory.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">{invoice.invoiceNumber}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{invoice.type}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{invoice.date}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{invoice.time}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{invoice.billTo}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => downloadPDF(invoice)}
                              className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    </div>
  );
}
