import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, AlertCircle, FileText, Download, Plus, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { importCSV, importPreview } from '../../api/customer.api';
import toast from 'react-hot-toast';

export default function CSVImportModal({ isOpen, onClose, onImportSuccess, uploadedFields = [] }) {
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Preview, 3 = Results
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  // Custom column state
  const [customColumns, setCustomColumns] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  
  const fileInputRef = useRef(null);

  // Reset modal state
  const handleClose = () => {
    setStep(1);
    setFile(null);
    setPreviewRows([]);
    setResults(null);
    setCustomColumns([]);
    setFileHeaders([]);
    setMapping({});
    onClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    const ext = droppedFile.name.split('.').pop().toLowerCase();
    if (droppedFile && ['csv', 'xlsx', 'xls', 'json'].includes(ext)) {
      processFile(droppedFile);
    } else {
      toast.error('Only CSV, Excel, and JSON files are allowed');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setImporting(true);
    try {
      const res = await importPreview(selectedFile);
      if (res.success) {
        setPreviewRows(res.data.preview);
        const detectedHeaders = res.data.headers;
        setFileHeaders(detectedHeaders);
        setMapping(res.data.mapping || {});
        const standardHeaders = ['name', 'email', 'phone', 'city', 'gender', 'tags', 'totalSpend', 'orderCount', 'lastOrderDate', 'avgOrderValue'];
        const customCols = detectedHeaders.filter(h => !standardHeaders.includes(h));
        setCustomColumns(customCols);
        setStep(2);
      } else {
        toast.error(res.error || 'Failed to parse file');
      }
    } catch (err) {
      toast.error(`Parsing failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleMapChange = (header, targetField) => {
    setMapping(prev => ({
      ...prev,
      [header]: targetField
    }));
  };

  const triggerImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await importCSV(file, mapping);
      if (res.success) {
        setResults(res.data);
        setStep(3);
        onImportSuccess();
        toast.success('Import completed successfully');
      } else {
        toast.error(res.error || 'Failed to import customers');
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
      title="Import Customers"
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
              <p className="text-sm font-semibold text-text-primary">Drag and drop your file here (CSV, Excel, or JSON)</p>
              <p className="text-xs text-text-secondary">or click to browse local files</p>
            </div>
            <p className="text-[10px] text-text-muted">Maximum file size: 10MB</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.xls,.json"
              className="hidden"
            />
          </div>

          {/* Guidelines / Active Fields */}
          <div className="bg-surface-elevated/45 p-4 rounded-xl border border-border/60 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
              <span>Your Workspace Fields (Active):</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              {uploadedFields.map((field, idx) => {
                const isStandard = ['name', 'email', 'phone', 'city', 'gender', 'tags', 'totalSpend', 'orderCount', 'lastOrderDate', 'avgOrderValue'].includes(field);
                const displayLabel = field === 'totalSpend' ? 'total spend'
                  : field === 'orderCount' ? 'orders'
                  : field === 'lastOrderDate' ? 'last active'
                  : field;
                return (
                  <span
                    key={idx}
                    className={
                      isStandard
                        ? "bg-surface p-1.5 rounded border border-border/80 text-text-secondary font-semibold"
                        : "bg-primary/10 text-primary-light p-1.5 rounded border border-primary/20 font-bold uppercase tracking-wider"
                    }
                  >
                    {displayLabel}
                    {field === 'name' && ' (Required)'}
                    {field === 'email' && ' (Unique)'}
                  </span>
                );
              })}
              {uploadedFields.length === 0 && (
                <span className="col-span-3 py-4 text-center text-text-muted text-xs italic">
                  No active fields yet. Please upload a file to detect and map fields.
                </span>
              )}
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
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted">Previewing first 2 rows</h5>
            <div className="glass-card overflow-hidden border-border/50 max-h-[40vh] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/40 font-semibold text-text-secondary">
                    {fileHeaders.map((header) => {
                      const targetField = mapping[header];
                      const isRight = targetField === 'totalSpend';
                      const isCenter = ['orderCount', 'lastOrderDate'].includes(targetField);
                      return (
                        <th
                          key={header}
                          className={`px-4 py-2 ${isRight ? 'text-right' : isCenter ? 'text-center' : ''}`}
                        >
                          {header}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {previewRows.slice(0, 2).map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/20 text-text-secondary">
                      {fileHeaders.map((header) => {
                        const targetField = mapping[header];
                        const isRight = targetField === 'totalSpend';
                        const isCenter = ['orderCount', 'lastOrderDate'].includes(targetField);
                        let cellContent = '—';

                        if (targetField === 'tags') {
                          cellContent = Array.isArray(row.tags) && row.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.tags.map((t, tIdx) => (
                                <span key={tIdx} className="bg-primary/10 text-primary-light px-1 rounded text-[9px]">
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : '—';
                        } else if (targetField === 'totalSpend') {
                          cellContent = row.totalSpend !== undefined ? `₹${Number(row.totalSpend).toLocaleString('en-IN')}` : '—';
                        } else if (targetField === 'orderCount') {
                          cellContent = row.orderCount !== undefined ? row.orderCount : '—';
                        } else if (targetField === 'lastOrderDate') {
                          cellContent = row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString('en-IN') : '—';
                        } else if (['name', 'email', 'phone', 'city', 'gender'].includes(targetField)) {
                          cellContent = row[targetField] || '—';
                        } else {
                          cellContent = row.customFields && row.customFields[header] !== undefined ? String(row.customFields[header]) : '—';
                        }

                        return (
                          <td
                            key={header}
                            className={`px-4 py-2 ${
                              isRight
                                ? 'text-right font-semibold text-text-primary'
                                : isCenter
                                ? 'text-center'
                                : targetField === 'name'
                                ? 'font-medium text-text-primary'
                                : ''
                            }`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configure Column Mapping */}
          <div className="bg-surface-elevated/20 p-5 rounded-xl border border-border/40 space-y-4 mt-4">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 font-display">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary-light" />
                <span>Configure Column Mapping</span>
              </h5>
              <p className="text-[10px] text-text-secondary mt-1">
                We've auto-detected some fields based on your file. Adjust the dropdowns below if you want to map different columns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(mapping).map((header) => {
                const currentVal = mapping[header];
                return (
                  <div key={header} className="flex items-center justify-between gap-3 bg-surface p-2.5 rounded-lg border border-border/60">
                    <span className="text-xs font-mono font-medium truncate max-w-[150px] text-text-primary" title={header}>
                      {header}
                    </span>
                    <select
                      value={currentVal}
                      onChange={(e) => handleMapChange(header, e.target.value)}
                      className="bg-surface-elevated border border-border text-[11px] rounded-lg p-1.5 text-text-primary outline-none focus:border-primary w-40"
                    >
                      <option value="name">Name (Required)</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone Number</option>
                      <option value="city">City</option>
                      <option value="gender">Gender</option>
                      <option value="tags">Tags</option>
                      <option value="totalSpend">Total Spend</option>
                      <option value="orderCount">Orders</option>
                      <option value="lastOrderDate">Last Active Date</option>
                      <option value="custom">Custom Field</option>
                    </select>
                  </div>
                );
              })}
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
