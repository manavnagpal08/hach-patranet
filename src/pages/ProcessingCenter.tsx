import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Search, AlertCircle } from 'lucide-react';
import { api, type Document } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ProcessingCenter: React.FC = () => {
  const [doc, setDoc] = useState<Document | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Poll the latest document every 2 seconds
    const interval = setInterval(() => {
      api.getDocuments().then(docs => {
        if (docs.length > 0) {
          const latest = docs[0];
          setDoc(latest);
          
          if (latest.status === 'Completed') {
            clearInterval(interval);
            setTimeout(() => {
              navigate(`/results?id=${latest.id}`);
            }, 1500);
          } else if (latest.status === 'Error') {
            clearInterval(interval);
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  const [elapsed, setElapsed] = useState(0);

  // Determine overall state safely
  const isCompleted = doc?.status === 'Completed';
  const isError = doc?.status === 'Error';
  const isPending = doc?.status === 'Pending';
  const isProcessing = doc ? (!isCompleted && !isError && !isPending) : false;

  useEffect(() => {
    let timer: any;
    if (isProcessing) {
      timer = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto pb-10 flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Waiting for documents...</p>
      </div>
    );
  }



  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const activeEngine = localStorage.getItem('active_engine') || 'local';

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Processing Pipeline
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              activeEngine === 'gemini' ? 'bg-purple-100 text-purple-700' :
              activeEngine === 'groq' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              Engine: {activeEngine.toUpperCase()}
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Live view of the document processing engine.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{doc.filename}</h2>
            <p className="text-sm text-slate-500 mt-1">Status: {doc.status}</p>
          </div>
          <div className="text-right">
            {isCompleted ? (
              <div className="text-3xl font-extrabold text-green-600">100%</div>
            ) : isError ? (
              <div className="text-3xl font-extrabold text-red-600">FAILED</div>
            ) : (
              <div className="text-3xl font-extrabold text-indigo-600 flex items-center justify-end gap-2">
                <Loader2 className="w-6 h-6 animate-spin" /> {formatTime(elapsed)}
              </div>
            )}
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mt-1">Engine Timer</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-slate-100" />
          
          <div className="space-y-8">
            {/* Step 1: File Uploaded */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center gap-6">
              <div className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-green-500 text-white shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">1. Document Received</h3>
                <p className="text-sm text-green-600 flex items-center gap-1.5 mt-0.5 font-medium">Successfully uploaded securely</p>
              </div>
            </motion.div>

            {/* Step 2: OCR Pipeline */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={`relative flex items-center gap-6 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
              <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isCompleted || doc.status.includes('Llama') || doc.status.includes('Analyzing') || doc.status.includes('Cloud') ? 'bg-green-500 text-white' : 
                isError && doc.status.includes('OCR') ? 'bg-red-500 text-white' :
                doc.status.includes('OCR') ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                {isCompleted || doc.status.includes('Llama') || doc.status.includes('Analyzing') || doc.status.includes('Cloud') ? <CheckCircle2 className="w-5 h-5" /> : (isError && doc.status.includes('OCR')) ? <AlertCircle className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isPending ? 'text-slate-500' : 'text-slate-800'}`}>2. Vision & OCR Processing</h3>
                {doc.status.includes('OCR') && !isError && (
                   <div className="text-sm text-indigo-600 flex items-center gap-1.5 mt-0.5 font-medium">
                     <Loader2 className="w-4 h-4 animate-spin" /> {doc.status}
                   </div>
                )}
                {(isCompleted || doc.status.includes('Llama') || doc.status.includes('Analyzing') || doc.status.includes('Cloud')) && (
                  <p className="text-sm text-green-600 flex items-center gap-1.5 mt-0.5 font-medium">Text successfully extracted</p>
                )}
              </div>
            </motion.div>

            {/* Step 3: LLM Structuring */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className={`relative flex items-center gap-6 ${!isCompleted && !doc.status.includes('Llama') && !doc.status.includes('Analyzing') && !doc.status.includes('Cloud') && !isError ? 'opacity-40' : 'opacity-100'}`}>
              <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isCompleted ? 'bg-green-500 text-white' : 
                isError && !doc.status.includes('OCR') ? 'bg-red-500 text-white' :
                (doc.status.includes('Llama') || doc.status.includes('Analyzing') || doc.status.includes('Cloud')) ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (isError && !doc.status.includes('OCR')) ? <AlertCircle className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${!isCompleted && !doc.status.includes('Llama') && !doc.status.includes('Analyzing') && !doc.status.includes('Cloud') && !isError ? 'text-slate-500' : 'text-slate-800'}`}>3. AI Semantic Structuring</h3>
                {(doc.status.includes('Llama') || doc.status.includes('Analyzing') || doc.status.includes('Cloud')) && !isCompleted && !isError && (
                   <div className="text-sm text-indigo-600 flex items-center gap-1.5 mt-0.5 font-medium">
                     <Loader2 className="w-4 h-4 animate-spin" /> {doc.status}
                   </div>
                )}
                {isCompleted && (
                  <p className="text-sm text-green-600 flex items-center gap-1.5 mt-0.5 font-medium">Data successfully structured</p>
                )}
                {isError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 mt-0.5 font-medium">{doc.status}</p>
                )}
              </div>
            </motion.div>

            {/* Step 4: Finalization */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={`relative flex items-center gap-6 ${!isCompleted ? 'opacity-40' : 'opacity-100'}`}>
              <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${!isCompleted ? 'text-slate-500' : 'text-slate-800'}`}>4. Compile JSON & Display</h3>
                {isCompleted && (
                  <p className="text-sm text-green-600 flex items-center gap-1.5 mt-0.5 font-medium">Ready for visualization</p>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
