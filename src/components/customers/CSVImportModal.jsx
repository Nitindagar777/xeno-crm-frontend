import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, AlertCircle, FileText, Download, Plus, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { importCSV } from '../../api/customer.api';
import toast from 'react-hot-toast';

export default function CSVImportModal({ isOpen, onClose, onImportSuccess }) {
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Preview, 3 = Results
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  // Custom column state
  const [customColumns, setCustomColumns] = useState([]);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  
  const fileInputRef = useRef(null);

  // Reset modal state
  const handleClose = () => {
    setStep(1);
    setFile(null);
    setPreviewRows([]);
    setResults(null);
    setCustomColumns([]);
    setIsAddingCol(false);
    setNewColName('');
    onClose();
  };

  // Add custom column
  const handleSaveCustomColumn = (e) => {
    e.preventDefault();
    const cleanName = newColName.trim().toLowerCase();
    if (!cleanName) return;
    const standardKeys = ['name', 'email', 'phone', 'city', 'gender', 'tags'];
    if (standardKeys.includes(cleanName) || customColumns.includes(cleanName)) {
      toast.error('Column header already exists');
      return;
    }
    setCustomColumns([...customColumns, cleanName]);
    setNewColName('');
    setIsAddingCol(false);
    toast.success(`Custom column "${cleanName}" registered`);
  };

  // Generate and download sample CSV with custom columns
  const downloadSampleCSV = () => {
    const headers = ["name", "email", "phone", "city", "gender", "tags", "total spend", "orders", "last active", ...customColumns].join(",");
    const sampleVal1 = ["Ananya Patel", "ananya.p@gmail.com", "+919812345678", "Mumbai", "female", "vip;beauty-enthusiast", "15450.50", "6", "2026-05-15", ...customColumns.map(() => "value1")].join(",");
    const sampleVal2 = ["Aarav Mehta", "aarav.m@gmail.com", "+919876543210", "Delhi", "male", "discount-lover", "4800.00", "2", "2026-06-01", ...customColumns.map(() => "value2")].join(",");
    
    const csvContent = `${headers}\n${sampleVal1}\n${sampleVal2}\n`;
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "xeno_customer_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      processFile(droppedFile);
    } else {
      toast.error('Only CSV files are allowed');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    
    // Parse first 5 rows for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(Boolean);
      
      if (lines.length === 0) {
        toast.error('CSV file is empty');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const previewData = [];

      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const rowValues = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const rowObj = {};
        
        headers.forEach((header, index) => {
          rowObj[header.trim().toLowerCase()] = rowValues[index] || '';
        });
        previewData.push(rowObj);
      }
      
      setPreviewRows(previewData);
      setStep(2);
    };
    
    reader.readAsText(selectedFile);
  };

  const triggerImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await importCSV(file);
      if (res.success) {
        setResults(res.data);
        setStep(3);
        onImportSuccess();
        toast.success('CSV import completed');
      } else {
        toast.error(res.error || 'Failed to import CSV');
      }
    } catch (err) {
      toast.error(`Import failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Customers via CSV"
      size={step === 2 ? 'lg' : 'md'}
    >
      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 bg-surface-elevated/20 hover:bg-surface-elevated/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
          >
            <UploadCloud className="h-10 w-10 text-primary-light animate-pulse-slow" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">Drag and drop your CSV file here</p>
              <p className="text-xs text-text-secondary">or click to browse local files</p>
            </div>
            <p className="text-[10px] text-text-muted">Maximum file size: 10MB</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
          </div>

          {/* Add custom columns button */}
          {isAddingCol ? (
            <form onSubmit={handleSaveCustomColumn} className="flex items-center space-x-2 bg-surface-elevated/45 p-3 rounded-xl border border-border">
              <input
                type="text"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="Custom column header (e.g. age)"
                className="input-field py-1.5 text-xs flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" variant="primary">Add</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setIsAddingCol(false)}>Cancel</Button>
            </form>
          ) : null}

          {/* Guidelines */}
          <div className="bg-surface-elevated/45 p-4 rounded-xl border border-border/60 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
              <div className="flex items-center space-x-2">
                <span>Expected Columns:</span>
                <button
                  type="button"
                  onClick={() => setIsAddingCol(true)}
                  className="p-1 hover:bg-surface border border-border hover:border-primary/45 rounded-lg text-primary-light transition-all flex items-center justify-center"
                  title="Add Custom Column"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="text-primary-light hover:text-primary transition-colors flex items-center space-x-1 font-medium"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download sample CSV</span>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <span className="bg-surface p-1.5 rounded border border-border/80">name (Required)</span>
              <span className="bg-surface p-1.5 rounded border border-border/80">email (Unique)</span>
              <span className="bg-surface p-1.5 rounded border border-border/80">phone</span>
              <span className="bg-surface p-1.5 rounded border border-border/80">city</span>
              <span className="bg-surface p-1.5 rounded border border-border/80">gender (male/female/other)</span>
              <span className="bg-surface p-1.5 rounded border border-border/80">tags (semicolon separated)</span>
              <span className="bg-surface p-1.5 rounded border border-border/80 font-bold text-primary-light">total spend</span>
              <span className="bg-surface p-1.5 rounded border border-border/80 font-bold text-primary-light">orders</span>
              <span className="bg-surface p-1.5 rounded border border-border/80 font-bold text-primary-light">last active</span>
              {customColumns.map((col, idx) => (
                <span key={idx} className="bg-primary/10 text-primary-light p-1.5 rounded border border-primary/20 flex items-center justify-between px-2 font-bold uppercase tracking-wider relative group">
                  <span className="truncate">{col}</span>
                  <button
                    type="button"
                    onClick={() => setCustomColumns(customColumns.filter(c => c !== col))}
                    className="text-text-muted hover:text-danger ml-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center space-x-2 text-xs text-text-secondary bg-surface p-3 border border-border rounded-xl">
            <FileText className="h-5 w-5 text-primary-light flex-shrink-0" />
            <div className="truncate flex-1">
              File selected: <strong className="text-text-primary">{file?.name}</strong> ({(file?.size / 1024).toFixed(1)} KB)
            </div>
            <button
              onClick={() => { setStep(1); setFile(null); }}
              className="text-primary-light hover:underline text-xs"
            >
              Change file
            </button>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted">Previewing first 5 rows</h5>
            <div className="glass-card overflow-hidden border-border/50 max-h-[40vh] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/40 font-semibold text-text-secondary">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">City</th>
                    <th className="px-4 py-2">Gender</th>
                    <th className="px-4 py-2">Tags</th>
                    <th className="px-4 py-2">Total Spend</th>
                    <th className="px-4 py-2">Orders</th>
                    <th className="px-4 py-2">Last Active</th>
                    {customColumns.map(col => (
                      <th key={col} className="px-4 py-2 capitalize">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/20 text-text-secondary">
                      <td className="px-4 py-2 font-medium text-text-primary">{row.name || '—'}</td>
                      <td className="px-4 py-2">{row.email || '—'}</td>
                      <td className="px-4 py-2 font-mono">{row.phone || '—'}</td>
                      <td className="px-4 py-2">{row.city || '—'}</td>
                      <td className="px-4 py-2 capitalize">{row.gender || '—'}</td>
                      <td className="px-4 py-2">
                        {row.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {row.tags.split(';').map((t, tIdx) => (
                              <span key={tIdx} className="bg-primary/10 text-primary-light px-1 rounded text-[9px]">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2">{row['total spend'] || row['totalspend'] || row['spend'] || '—'}</td>
                      <td className="px-4 py-2">{row['orders'] || row['ordercount'] || row['order count'] || '—'}</td>
                      <td className="px-4 py-2">{row['last active'] || row['lastactive'] || row['last order date'] || row['lastorderdate'] || '—'}</td>
                      {customColumns.map(col => (
                        <td key={col} className="px-4 py-2">
                          {row[col] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={triggerImport} loading={importing}>
              Import {file?.name && 'Customers'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-success/15 rounded-full text-success ring-4 ring-success/5">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-text-primary">Bulk Import Completed</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              We parsed your CSV file and inserted customer documents into MongoDB.
            </p>
          </div>

          {/* Counts overview */}
          <div className="grid grid-cols-3 gap-3 bg-surface-elevated/40 p-4 border border-border/80 rounded-xl">
            <div className="flex flex-col">
              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Imported</span>
              <span className="text-xl font-bold text-success mt-1">{results.imported}</span>
            </div>
            <div className="flex flex-col border-x border-border/60">
              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Skipped</span>
              <span className="text-xl font-bold text-warning mt-1">{results.skipped}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Total Rows</span>
              <span className="text-xl font-bold text-text-primary mt-1">
                {results.imported + results.skipped}
              </span>
            </div>
          </div>

          {/* Error messages if any */}
          {results.errors && results.errors.length > 0 && (
            <div className="space-y-2 text-left">
              <div className="flex items-center space-x-1 text-xs text-warning font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Skipped Rows Details ({results.errors.length})</span>
              </div>
              <div className="border border-border/80 rounded-xl bg-surface-elevated/20 max-h-[20vh] overflow-y-auto divide-y divide-border/60 text-[10px] font-mono px-3">
                {results.errors.map((err, idx) => (
                  <div key={idx} className="py-2 text-text-secondary flex justify-between">
                    <span>Row {err.row}: <strong className="text-text-primary">{err.email || 'Invalid'}</strong></span>
                    <span className="text-warning">{err.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-center">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
