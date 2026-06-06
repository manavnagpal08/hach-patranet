import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { api, type Document } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Poll the dashboard every 3 seconds to keep it live
    const fetchDocs = () => {
      api.getDocuments().then(data => {
        setDocuments(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    };
    
    fetchDocs();
    const interval = setInterval(fetchDocs, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Uploads', value: documents.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Successfully Structured', value: documents.filter(d => d.status === 'Completed').length.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Processing Now', value: documents.filter(d => d.status === 'Processing' || d.status === 'Pending').length.toString(), icon: Loader2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Failed Extractions', value: documents.filter(d => d.status === 'Error').length.toString(), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 pb-8 relative z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">Live metrics from your local intelligence engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stat.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className={`w-6 h-6 ${stat.label === 'Processing Now' && parseInt(stat.value) > 0 ? 'animate-spin' : ''}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Recent Documents</h2>
          <button onClick={() => navigate('/upload')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Upload New</button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No documents uploaded yet.</div>
          ) : (
            documents.slice(0, 10).map((doc, index) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (index * 0.05) }}
                onClick={() => {
                  if (doc.status === 'Completed') navigate(`/results?id=${doc.id}`);
                  else if (doc.status === 'Processing' || doc.status === 'Pending') navigate(`/processing`);
                }}
                className="p-4 hover:bg-slate-50 flex items-center gap-4 transition-colors cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  doc.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                  doc.status === 'Error' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{doc.filename}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.created_at).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {doc.document_type || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    doc.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                    doc.status === 'Error' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700 animate-pulse'
                  }`}>
                    {doc.status}
                  </span>
                  {doc.status === 'Completed' && (
                    <PlayCircle className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                  )}
                  {doc.status === 'Error' && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await api.retryDocument(doc.id);
                        api.getDocuments().then(setDocuments);
                        navigate('/processing');
                      }} 
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Simple Mock component for icon used above not imported
const Clock: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
