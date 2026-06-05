import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import { api, type Document } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDocuments().then(setDocs);
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Document History</h1>
        <p className="text-slate-500 mt-1">Review all previously processed documents and their data.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
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
                className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between"
                onClick={() => doc.status === 'Completed' && navigate(`/results?id=${doc.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${doc.status === 'Completed' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{doc.filename}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {doc.completed_at ? new Date(doc.completed_at).toLocaleString() : 'Pending/Error'}
                      </div>
                      {doc.total_amount && doc.total_amount !== 'N/A' && (
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          Total: {doc.total_amount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doc.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    doc.status === 'Error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status}
                  </span>
                  {doc.status === 'Completed' && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
