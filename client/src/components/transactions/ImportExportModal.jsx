import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Download, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { transactionService } from '../../services/api';
import { useFinance } from '../../context/FinanceContext';

const ImportExportModal = ({ isOpen, onClose, currentTransactions = [] }) => {
  const { refreshAll, addToast } = useFinance();
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);

  // Export to CSV
  const handleExportCSV = () => {
    if (currentTransactions.length === 0) {
      addToast('No transactions to export', 'error');
      return;
    }

    const headers = ['Date', 'Title', 'Amount', 'Type', 'Category', 'PaymentMethod', 'Notes'];
    const rows = currentTransactions.map((t) => [
      t.date ? t.date.split('T')[0] : '',
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendFlow_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Transactions exported to CSV!');
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (currentTransactions.length === 0) {
      addToast('No transactions to export', 'error');
      return;
    }

    const jsonStr = JSON.stringify(currentTransactions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendFlow_Transactions_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Transactions exported to JSON!');
  };

  // Handle CSV file drop or select
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setCsvText(content);
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  // Parse CSV
  const parseCSV = (text) => {
    try {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.replace(/["\r]/g, '').trim().toLowerCase());
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple regex to split by comma ignoring commas inside quotes
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (values.length < 3) continue;

        const cleanValues = values.map((v) => v.replace(/^"|"$/g, '').trim());

        const tx = {
          date: cleanValues[0] || new Date().toISOString(),
          title: cleanValues[1] || 'Imported Transaction',
          amount: parseFloat(cleanValues[2]) || 0,
          type: (cleanValues[3] || 'expense').toLowerCase(),
          category: cleanValues[4] || 'General Expense',
          paymentMethod: cleanValues[5] || 'Debit Card',
          notes: cleanValues[6] || '',
        };
        parsed.push(tx);
      }

      setParsedPreview(parsed);
    } catch (err) {
      console.error('Failed to parse CSV:', err);
      addToast('Failed to parse CSV structure', 'error');
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (parsedPreview.length === 0) {
      addToast('No valid transactions to import', 'error');
      return;
    }

    setImportLoading(true);
    try {
      await transactionService.importCsv(parsedPreview);
      addToast(`Successfully imported ${parsedPreview.length} transactions!`);
      refreshAll();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to import transactions', 'error');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import & Export Transactions" maxWidth="max-w-2xl">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'export'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'import'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import CSV</span>
        </button>
      </div>

      {activeTab === 'export' ? (
        <div className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Download your transaction history to keep backup records, perform external analysis in
            Excel / Google Sheets, or import into accounting software.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CSV Export Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Spreadsheet (CSV)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comma-separated format compatible with Excel, Google Sheets, Numbers.
              </p>
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download .CSV</span>
              </button>
            </div>

            {/* JSON Export Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Structured (JSON)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full programmatic JSON dataset including tags, timestamps and IDs.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Upload a CSV file containing transactions with columns:
            <br />
            <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
              Date, Title, Amount, Type, Category, PaymentMethod, Notes
            </code>
          </p>

          {/* File drop area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              id="csvFileInput"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="csvFileInput"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag & drop CSV file
              </span>
              <span className="text-xs text-slate-400">Supports .csv files up to 5MB</span>
            </label>
          </div>

          {/* Parsed Preview */}
          {parsedPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Parsed {parsedPreview.length} transactions ready to import
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0">
                    <tr>
                      <th className="p-2">Title</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedPreview.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-2 truncate font-medium">{row.title}</td>
                        <td className="p-2 capitalize">{row.type}</td>
                        <td className="p-2">{row.category}</td>
                        <td className="p-2 font-mono font-semibold">${row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmImport}
                disabled={importLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                {importLoading
                  ? 'Importing...'
                  : `Confirm Import (${parsedPreview.length} Records)`}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ImportExportModal;
