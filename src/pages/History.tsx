import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileText, ChevronRight, Trash2, Download } from 'lucide-react';
import { api, type Document } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDocuments().then(setDocs);
  }, []);

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch {
      alert('Failed to delete document.');
    }
    setDeletingId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} document(s)? This cannot be undone.`)) return;
    for (const id of Array.from(selectedIds)) {
      try { await api.deleteDocument(id); } catch {}
    }
    setDocs(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) return;
    setExporting(true);
    try {
      const details = await Promise.all(
        Array.from(selectedIds).map(id => api.getDocumentDetails(id))
      );
      const csvRows: string[] = [];
      const headers = ['Document ID', 'Filename', 'Type', 'Total Amount', 'Status', 'Extracted JSON'];
      csvRows.push(headers.join(','));
      details.forEach(detail => {
        if (!detail) return;
        const d = detail.document;
        const r = detail.results;
        const jsonStr = r?.json_structured ? JSON.stringify(r.json_structured).replace(/"/g, '""') : '';
        const total = typeof d.total_amount === 'object' ? (d.total_amount as any).value : d.total_amount;
        const row = [d.id, `"${d.filename}"`, `"${d.document_type || 'Unknown'}"`, `"${total || 'N/A'}"`, `"${d.status}"`, `"${jsonStr}"`];
        csvRows.push(row.join(','));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patranet_export_${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export documents');
    }
    setExporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Document Library</h1>
          <p className="text-slate-500 mt-1">Review, export and manage your processed documents.</p>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-semibold hover:bg-rose-100 transition-all active:scale-95 flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedIds.size}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleExport}
              disabled={exporting}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : `Export ${selectedIds.size}`}
            </motion.button>
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No documents processed yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            <AnimatePresence>
              {docs.map((doc, idx) => (
                <motion.li
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`p-5 hover:bg-indigo-50/30 transition-colors cursor-pointer group flex items-center justify-between ${selectedIds.has(doc.id) ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => doc.status === 'Completed' && navigate(`/results?id=${doc.id}`)}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <div
                      onClick={(e) => toggleSelect(doc.id, e)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                        selectedIds.has(doc.id)
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {selectedIds.has(doc.id) && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${doc.status === 'Completed' ? 'bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{doc.filename}</h3>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.completed_at ? new Date(doc.completed_at).toLocaleString() : 'Pending/Error'}
                        </div>
                        {doc.total_amount && doc.total_amount !== 'N/A' && (
                          <div className="font-medium text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md">
                            Total: {typeof doc.total_amount === 'object' ? (doc.total_amount as any).value : String(doc.total_amount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      doc.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/50' :
                      doc.status === 'Error' ? 'bg-rose-100 text-rose-700 border border-rose-200/50' :
                      'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                    }`}>
                      {doc.status}
                    </span>

                    {/* Delete button — appears on hover */}
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      disabled={deletingId === doc.id}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-90 disabled:opacity-50"
                      title="Delete document"
                    >
                      {deletingId === doc.id
                        ? <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>

                    {doc.status === 'Completed' && (
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};
