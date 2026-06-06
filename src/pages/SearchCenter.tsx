import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, type Document } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const SearchCenter: React.FC = () => {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<(Document & { snippet?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      if (query.trim() === '') {
        const data = await api.getDocuments();
        setDocuments(data);
      } else {
        const data = await api.searchDocuments(query);
        setDocuments(data);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(fetchDocs, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Search & Intelligence</h1>
        <p className="text-slate-500 mt-1">Quickly locate documents across your local SQLite database.</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-3xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          placeholder="Search by filename or document type..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-700">
            {query.trim() === '' ? 'All Documents' : `Search Results (${documents.length})`}
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              Searching database...
            </div>
          ) : documents.length > 0 ? (
            documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/results?id=${doc.id}`)}
                className="p-5 flex items-start justify-between hover:bg-slate-50 cursor-pointer group transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    doc.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                    doc.status === 'Error' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{doc.filename}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                      {doc.document_type && (
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
                          {doc.document_type}
                        </span>
                      )}
                    </div>
                    {doc.snippet && (
                      <div className="mt-3 text-sm text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 italic">
                        "{doc.snippet}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {doc.status === 'Completed' ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : doc.status === 'Error' ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full animate-pulse">
                      Processing
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No documents found matching "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
