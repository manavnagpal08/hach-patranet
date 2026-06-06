import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import { api, type Document } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    if (selectedIds.size === 0) return;
    setExporting(true);
    try {
      const details = await Promise.all(
        Array.from(selectedIds).map(id => api.getDocumentDetails(id))
      );
      
      const csvRows = [];
      const headers = ['Document ID', 'Filename', 'Type', 'Total Amount', 'Status', 'Extracted JSON'];
      csvRows.push(headers.join(','));

      details.forEach(detail => {
        if (!detail) return;
        const d = detail.document;
        const r = detail.results;
        const jsonStr = r?.json_structured ? JSON.stringify(r.json_structured).replace(/"/g, '""') : '';
        const total = typeof d.total_amount === 'object' ? (d.total_amount as any).value : d.total_amount;
        
        const row = [
          d.id,
          `"${d.filename}"`,
          `"${d.document_type || 'Unknown'}"`,
          `"${total || 'N/A'}"`,
          `"${d.status}"`,
          `"${jsonStr}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patranet_export_${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to export documents');
    }
    setExporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Document Library</h1>
          <p className="text-slate-500 mt-1">Review and batch export previously processed documents.</p>
        </div>
        
        {selectedIds.size > 0 && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {exporting ? 'Exporting...' : `Export ${selectedIds.size} Selected`}
          </motion.button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No documents processed yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {docs.map((doc, idx) => (
              <motion.li 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={doc.id} 
                className={`p-6 hover:bg-indigo-50/30 transition-colors cursor-pointer group flex items-center justify-between ${selectedIds.has(doc.id) ? 'bg-indigo-50/50' : ''}`}
                onClick={() => doc.status === 'Completed' && navigate(`/results?id=${doc.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    onClick={(e) => toggleSelect(doc.id, e)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                      selectedIds.has(doc.id) 
                        ? 'bg-indigo-500 border-indigo-500 text-white' 
                        : 'border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {selectedIds.has(doc.id) && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${doc.status === 'Completed' ? 'bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{doc.filename}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {doc.completed_at ? new Date(doc.completed_at).toLocaleString() : 'Pending/Error'}
                      </div>
                      {doc.total_amount && doc.total_amount !== 'N/A' && (
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          Total: {typeof doc.total_amount === 'object' ? (doc.total_amount as any).value : String(doc.total_amount)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                    doc.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/50' :
                    doc.status === 'Error' ? 'bg-rose-100 text-rose-700 border border-rose-200/50' : 'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                  }`}>
                    {doc.status}
                  </span>
                  {doc.status === 'Completed' && <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
