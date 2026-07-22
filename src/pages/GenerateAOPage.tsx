import { useState, useEffect } from 'react';
import { FileText, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AOItem {
  description: string;
  quantity: number;
  unitPrice: number;
  gst: number;
}

interface AOData {
  id: string;
  type: 'AO';
  invoiceNumber: string;
  date: string;
  time: string;
  location: string;
  customerName: string;
  address: string;
  gstin: string;
  state: string;
  items: AOItem[];
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  notes: string;
  status: string;
}

export default function GenerateAOPage() {
  const [location, setLocation] = useState<'Andhra Pradesh' | 'Bhubaneswar'>('Andhra Pradesh');
  const [aoHistory, setAoHistory] = useState<AOData[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    gstin: '',
    state: '',
    bankName: 'AXIS BANK',
    accountNumber: '924020008065248',
    ifscCode: 'UTIB0003240',
    notes: 'Thanks for doing business with us!'
  });
  const [items, setItems] = useState<AOItem[]>([
    { description: '', quantity: 1, unitPrice: 0, gst: 18 }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('aoHistory');
    if (saved) {
      setAoHistory(JSON.parse(saved));
    }
  }, []);

  const getNextInvoiceNumber = () => {
    const allRecords = [...aoHistory];
    const savedInvoice = localStorage.getItem('invoiceHistory');
    if (savedInvoice) {
      allRecords.push(...JSON.parse(savedInvoice));
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

  const updateItem = (index: number, field: keyof AOItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: AOItem) => {
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

  const generatePDF = () => {
    try {
      console.log('Starting PDF generation...');
      const doc = new jsPDF();
      const aoNumber = getNextInvoiceNumber();
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-IN');
      const timeStr = currentDate.toLocaleTimeString('en-IN');
      
      console.log('AO Number:', aoNumber);
      console.log('Items:', items);

    // Header
    doc.setFontSize(10);
    doc.text('SUPERBEE AERONAUTICS PVT. LTD', 20, 20);
    doc.setFontSize(8);
    doc.text('Supplier of Drone Components / Simulators / Sensors', 20, 25);
    if (location === 'Bhubaneswar') {
      doc.text('C/o Centurion University of Technology and Management,', 20, 29);
      doc.text('Techno Village, Jatni, Khurda, Bhubaneswar, Odisha 752050', 20, 33);
      doc.text('GSTIN: 21AACCU0792B1Z8', 20, 37);
      doc.text('State: 21-Odisha', 20, 41);
    } else {
      doc.text('L2a Centurion University of Technology and Management Survey No. 10 + 10 & ', 20, 29);
      doc.text('Techno Village, Malkangiri, 535 001, Andhra Pradesh 535001', 20, 33);
      doc.text('GSTIN: 21AACCU0792B1Z8', 20, 37);
      doc.text('State: 36-Telangana', 20, 41);
    }

    // Add logo placeholder
    // doc.setFontSize(12);
    // doc.text('SUPERBEE', 160, 25);
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(128, 0, 128);
    doc.text('Acceptance Order (AO)', 105, 55, { align: 'center' });
    
    // AO Details
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`PO No: ${aoNumber}`, 140, 70);
    doc.text(`Date: ${dateStr}`, 140, 75);
    doc.text(`Place of supply: ${location}`, 140, 80);

    // Customer Details
    doc.setFontSize(10);
    doc.text('Customer Details', 20, 70);
    doc.setFontSize(9);
    doc.text(formData.customerName, 20, 75);
    doc.text(formData.address, 20, 80);
    doc.text(`GSTIN/UIN: ${formData.gstin}`, 20, 85);
    doc.text(`State: ${formData.state}`, 20, 90);

    // Items Table
    const totals = calculateTotals();
    const tableData = items.map((item, index) => [
      index + 1,
      item.description,
      item.quantity,
      `₹ ${item.unitPrice.toFixed(2)}`,
      `${item.gst}%`,
      `₹ ${calculateItemTotal(item).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['#', 'Item Description', 'Quantity', 'Price/Unit', 'GST', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [128, 128, 200], textColor: 255 },
      styles: { fontSize: 8 }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 160;
    doc.text(`Sub Total: ₹ ${totals.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`SGST@9%: ₹ ${(totals.gstTotal / 2).toFixed(2)}`, 140, finalY + 5);
    doc.text(`CGST@9%: ₹ ${(totals.gstTotal / 2).toFixed(2)}`, 140, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Total: ₹ ${totals.total.toFixed(2)}`, 140, finalY + 20);

    // Bank Details
    doc.setFontSize(9);
    doc.text('Bank Details:', 20, finalY + 10);
    doc.text(`Bank Name: ${formData.bankName}`, 20, finalY + 15);
    doc.text(`Account Number: ${formData.accountNumber}`, 20, finalY + 20);
    doc.text(`IFSC Code: ${formData.ifscCode}`, 20, finalY + 25);

    // Terms and Conditions
    doc.text('Terms and Conditions:', 20, finalY + 35);
    doc.setFontSize(8);
    doc.text('1. This is an acceptance order for the mentioned items.', 20, finalY + 40);
    doc.text('2. Payment terms as agreed upon.', 20, finalY + 44);
    doc.text('3. Delivery within the agreed timeline.', 20, finalY + 48);

    // Notes
    if (formData.notes) {
      doc.setFontSize(9);
      doc.text('Notes:', 20, finalY + 58);
      doc.text(formData.notes, 20, finalY + 63);
    }

    // Save PDF
    console.log('Saving PDF...');
    doc.save(`AO_${aoNumber}_${dateStr}.pdf`);
    console.log('PDF saved successfully!');

    // Save to history
    const newAO: AOData = {
      id: Date.now().toString(),
      type: 'AO',
      invoiceNumber: aoNumber,
      date: dateStr,
      time: timeStr,
      location,
      customerName: formData.customerName,
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

    const updatedHistory = [...aoHistory, newAO];
    setAoHistory(updatedHistory);
    localStorage.setItem('aoHistory', JSON.stringify(updatedHistory));
    console.log('AO saved to history');

    // Reset form
    setFormData({
      customerName: '',
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
    alert('AO PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    }
  };

  const deleteAO = (id: string) => {
    const updatedHistory = aoHistory.filter(ao => ao.id !== id);
    setAoHistory(updatedHistory);
    localStorage.setItem('aoHistory', JSON.stringify(updatedHistory));
  };

  const downloadPDF = (ao: AOData) => {
    // Regenerate PDF from history
    const doc = new jsPDF();

    doc.setFontSize(10);
    doc.text('SUPERBEE AERONAUTICS PVT. LTD', 20, 20);
    doc.setFontSize(8);
    doc.text('Supplier of Drone Components / Simulators / Sensors', 20, 25);
    doc.text('L2a Centurion University of Technology and Management Survey No. 10 + 10 & ', 20, 29);
    doc.text('Techno Village, Malkangiri, 535 001, Andhra Pradesh 535001', 20, 33);
    doc.text('GSTIN: 21AACCU0792B1Z8', 20, 37);
    doc.text('State: 36-Telangana', 20, 41);

    doc.setFontSize(12);
    doc.text('SUPERBEE', 160, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(128, 0, 128);
    doc.text('Acceptance Order (AO)', 105, 55, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`PO No: ${ao.invoiceNumber}`, 140, 70);
    doc.text(`Date: ${ao.date}`, 140, 75);
    doc.text(`Place of supply: ${ao.location}`, 140, 80);

    doc.setFontSize(10);
    doc.text('Customer Details', 20, 70);
    doc.setFontSize(9);
    doc.text(ao.customerName, 20, 75);
    doc.text(ao.address, 20, 80);
    doc.text(`GSTIN/UIN: ${ao.gstin}`, 20, 85);
    doc.text(`State: ${ao.state}`, 20, 90);

    const tableData = ao.items.map((item, index) => [
      index + 1,
      item.description,
      item.quantity,
      `₹ ${item.unitPrice.toFixed(2)}`,
      `${item.gst}%`,
      `₹ ${calculateItemTotal(item).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['#', 'Item Description', 'Quantity', 'Price/Unit', 'GST', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [128, 128, 200], textColor: 255 },
      styles: { fontSize: 8 }
    });

    const totals = {
      subtotal: ao.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      gstTotal: ao.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gst) / 100), 0),
      total: 0
    };
    totals.total = totals.subtotal + totals.gstTotal;

    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 160;
    doc.text(`Sub Total: ₹ ${totals.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`SGST@9%: ₹ ${(totals.gstTotal / 2).toFixed(2)}`, 140, finalY + 5);
    doc.text(`CGST@9%: ₹ ${(totals.gstTotal / 2).toFixed(2)}`, 140, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Total: ₹ ${totals.total.toFixed(2)}`, 140, finalY + 20);

    doc.setFontSize(9);
    doc.text('Bank Details:', 20, finalY + 10);
    doc.text(`Bank Name: ${ao.bankName}`, 20, finalY + 15);
    doc.text(`Account Number: ${ao.accountNumber}`, 20, finalY + 20);
    doc.text(`IFSC Code: ${ao.ifscCode}`, 20, finalY + 25);

    doc.text('Terms and Conditions:', 20, finalY + 35);
    doc.setFontSize(8);
    doc.text('1. This is an acceptance order for the mentioned items.', 20, finalY + 40);
    doc.text('2. Payment terms as agreed upon.', 20, finalY + 44);
    doc.text('3. Delivery within the agreed timeline.', 20, finalY + 48);

    if (ao.notes) {
      doc.setFontSize(9);
      doc.text('Notes:', 20, finalY + 58);
      doc.text(ao.notes, 20, finalY + 63);
    }

    doc.save(`AO_${ao.invoiceNumber}_${ao.date}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Generate AO Request</h1>
          <p className="text-slate-600 mt-1">Create and manage Acceptance Order (AO) requests with PDF generation</p>
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
          {/* AO Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">AO Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.unitPrice === 0 ? '' : item.unitPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
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
              disabled={!formData.customerName || !formData.address || !formData.gstin || !formData.state || items.some(i => !i.description || !i.unitPrice)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-5 w-5" />
              <span>Generate AO PDF</span>
            </button>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">AO History</h2>
            {aoHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No AO requests generated yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">PO Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aoHistory.map((ao) => (
                      <tr key={ao.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">{ao.invoiceNumber}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{ao.type}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{ao.date}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{ao.time}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{ao.customerName}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {ao.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => downloadPDF(ao)}
                              className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteAO(ao.id)}
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
