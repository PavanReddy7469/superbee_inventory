import { useState, useEffect } from 'react';
import { FileText, Trash2, Download, Search, Eye, Filter, RefreshCw, X } from 'lucide-react';
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

export default function PiRequestPage() {
  const [aoHistory, setAoHistory] = useState<AOData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedAO, setSelectedAO] = useState<AOData | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem('aoHistory');
    if (saved) {
      setAoHistory(JSON.parse(saved));
    }
  };

  const deleteAO = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this PI request?')) return;
    const updated = aoHistory.filter(item => item.id !== id);
    setAoHistory(updated);
    localStorage.setItem('aoHistory', JSON.stringify(updated));
    if (selectedAO?.id === id) {
      setSelectedAO(null);
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = aoHistory.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setAoHistory(updated);
    localStorage.setItem('aoHistory', JSON.stringify(updated));
    if (selectedAO?.id === id) {
      setSelectedAO({ ...selectedAO, status: newStatus });
    }
  };

  const calculateItemTotal = (item: AOItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const gstAmount = (subtotal * item.gst) / 100;
    return subtotal + gstAmount;
  };

  const calculateTotals = (items: AOItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const gstTotal = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.gst) / 100), 0);
    const total = subtotal + gstTotal;
    return { subtotal, gstTotal, total };
  };

  const downloadPDF = (ao: AOData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const doc = new jsPDF();
      const dateStr = ao.date;
      
      // Header
      doc.setFontSize(10);
      doc.text('SUPERBEE AERONAUTICS PVT. LTD', 20, 20);
      doc.setFontSize(8);
      doc.text('Supplier of Drone Components / Simulators / Sensors', 20, 25);
      doc.text('L2a Centurion University of Technology and Management Survey No. 10 + 10 & ', 20, 29);
      doc.text('Techno Village, Malkangiri, 535 001, Andhra Pradesh 535001', 20, 33);
      doc.text('GSTIN: 21AACCU0792B1Z8', 20, 37);
      doc.text('State: 36-Telangana', 20, 41);
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(128, 0, 128);
      doc.text('Acceptance Order (AO) / Proforma Invoice', 105, 55, { align: 'center' });
      
      // AO Details
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`PI No: ${ao.invoiceNumber}`, 140, 70);
      doc.text(`Date: ${ao.date}`, 140, 75);
      doc.text(`Place of supply: ${ao.location}`, 140, 80);

      // Customer Details
      doc.setFontSize(10);
      doc.text('Customer Details', 20, 70);
      doc.setFontSize(9);
      doc.text(ao.customerName, 20, 75);
      doc.text(ao.address, 20, 80);
      doc.text(`GSTIN/UIN: ${ao.gstin}`, 20, 85);
      doc.text(`State: ${ao.state}`, 20, 90);

      // Items Table
      const totals = calculateTotals(ao.items);
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

      // Totals
      const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 160;
      doc.text(`Sub Total: ₹ ${totals.subtotal.toFixed(2)}`, 140, finalY);
      doc.text(`SGST: ₹ ${(totals.gstTotal / 2).toFixed(2)}`, 140, finalY + 5);
      doc.text(`CGST: ₹ ${(totals.gstTotal / 2).toFixed(2)}`, 140, finalY + 10);
      doc.setFontSize(10);
      doc.text(`Total: ₹ ${totals.total.toFixed(2)}`, 140, finalY + 20);

      // Bank Details
      doc.setFontSize(9);
      doc.text('Bank Details:', 20, finalY + 10);
      doc.text(`Bank Name: ${ao.bankName}`, 20, finalY + 15);
      doc.text(`Account Number: ${ao.accountNumber}`, 20, finalY + 20);
      doc.text(`IFSC Code: ${ao.ifscCode}`, 20, finalY + 25);

      // Terms and Conditions
      doc.text('Terms and Conditions:', 20, finalY + 35);
      doc.setFontSize(8);
      doc.text('1. This is a proforma invoice for the mentioned items.', 20, finalY + 40);
      doc.text('2. Payment terms as agreed upon.', 20, finalY + 44);
      doc.text('3. Delivery within the agreed timeline.', 20, finalY + 48);

      // Notes
      if (ao.notes) {
        doc.setFontSize(9);
        doc.text('Notes:', 20, finalY + 58);
        doc.text(ao.notes, 20, finalY + 63);
      }

      doc.save(`PI_${ao.invoiceNumber}_${dateStr.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  const filteredHistory = aoHistory.filter(ao => {
    const matchesSearch = 
      ao.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ao.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ao.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ao.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || ao.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PI Requests History</h1>
          <p className="text-slate-600 mt-1">Manage and track generated Proforma Invoice / Allocation Order requests</p>
        </div>
        <button 
          onClick={loadHistory}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total PIs Generated</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{aoHistory.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending/Active</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {aoHistory.filter(a => a.status === 'Generated' || a.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Approved/Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {aoHistory.filter(a => a.status === 'Paid' || a.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {aoHistory.filter(a => a.status === 'Cancelled').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search PI number, customer, state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Generated">Generated</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Locations</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Bhubaneswar">Bhubaneswar</option>
          </select>
        </div>
      </div>

      {/* PI Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No Proforma Invoice records found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PI Number</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date / Time</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHistory.map((ao) => {
                  const totals = calculateTotals(ao.items);
                  return (
                    <tr 
                      key={ao.id} 
                      onClick={() => setSelectedAO(ao)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-sm font-semibold text-indigo-600">{ao.invoiceNumber}</td>
                      <td className="py-3.5 px-4 text-sm text-slate-800 font-medium">{ao.customerName}</td>
                      <td className="py-3.5 px-4 text-sm text-slate-600">{ao.location}</td>
                      <td className="py-3.5 px-4 text-sm text-slate-600">
                        {ao.date} <span className="text-xs text-slate-400">({ao.time})</span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-slate-800">₹ {totals.total.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ao.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(ao.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2.5 py-1 focus:outline-none ${
                            ao.status === 'Paid'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : ao.status === 'Approved'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : ao.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <option value="Generated">Generated</option>
                          <option value="Approved">Approved</option>
                          <option value="Paid">Paid</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAO(ao)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => downloadPDF(ao, e)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => deleteAO(ao.id, e)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Proforma Invoice Details</span>
                <h3 className="text-lg font-bold text-slate-800">{selectedAO.invoiceNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedAO(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Customer Information</h4>
                  <p className="font-semibold text-slate-800 text-sm">{selectedAO.customerName}</p>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">{selectedAO.address}</p>
                  <p className="text-slate-600 text-xs mt-1"><strong>GSTIN/UIN:</strong> {selectedAO.gstin}</p>
                  <p className="text-slate-600 text-xs"><strong>State:</strong> {selectedAO.state}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Order Information</h4>
                  <p className="text-slate-600 text-xs"><strong>Place of Supply:</strong> {selectedAO.location}</p>
                  <p className="text-slate-600 text-xs"><strong>Date:</strong> {selectedAO.date} at {selectedAO.time}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-slate-600">Status:</span>
                    <select
                      value={selectedAO.status}
                      onChange={(e) => updateStatus(selectedAO.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2.5 py-1 focus:outline-none ${
                        selectedAO.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : selectedAO.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedAO.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <option value="Generated">Generated</option>
                      <option value="Approved">Approved</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs">Line Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-left">
                        <th className="py-2 px-3 text-xs font-bold text-slate-600">Item description</th>
                        <th className="py-2 px-3 text-xs font-bold text-slate-600 text-center">Qty</th>
                        <th className="py-2 px-3 text-xs font-bold text-slate-600 text-right">Price/Unit</th>
                        <th className="py-2 px-3 text-xs font-bold text-slate-600 text-center">GST</th>
                        <th className="py-2 px-3 text-xs font-bold text-slate-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {selectedAO.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 text-slate-800 font-medium text-xs">{item.description}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-center text-xs">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-right text-xs">₹ {item.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-center text-xs">{item.gst}%</td>
                          <td className="py-2.5 px-3 text-slate-800 font-semibold text-right text-xs">
                            ₹ {calculateItemTotal(item).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary & Bank Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Bank Transfer Instructions</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 text-xs text-slate-600">
                    <p><strong>Bank:</strong> {selectedAO.bankName}</p>
                    <p><strong>Account:</strong> {selectedAO.accountNumber}</p>
                    <p><strong>IFSC:</strong> {selectedAO.ifscCode}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Financial Summary</h4>
                  {(() => {
                    const totals = calculateTotals(selectedAO.items);
                    return (
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Sub Total:</span>
                          <span className="font-medium text-slate-800">₹ {totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST @9%:</span>
                          <span className="font-medium text-slate-800">₹ {(totals.gstTotal / 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST @9%:</span>
                          <span className="font-medium text-slate-800">₹ {(totals.gstTotal / 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                          <span>Total Amount:</span>
                          <span>₹ {totals.total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Notes */}
              {selectedAO.notes && (
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-3.5 text-xs text-slate-600">
                  <strong className="text-yellow-800">Notes / Remarks:</strong>
                  <p className="mt-1 leading-relaxed">{selectedAO.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between p-5 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button
                onClick={(e) => deleteAO(selectedAO.id, e)}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Delete PI
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAO(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-sm transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadPDF(selectedAO)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
