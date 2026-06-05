import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, CheckCircle2, AlertCircle, FileText, FileImage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  backendId?: number;
}

export const UploadCenter: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = (newFiles: FileList | File[]) => {
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const newUploads: UploadFile[] = Array.from(newFiles)
      .filter(f => validExtensions.includes(f.name.split('.').pop()?.toLowerCase() || ''))
      .map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: 'pending'
      }));

    setFiles(prev => [...prev, ...newUploads]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const navigate = useNavigate();

  const startUpload = async () => {
    for (const f of files) {
      if (f.status === 'pending') {
        setFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'uploading', progress: 50 } : item));
        try {
          const res = await api.uploadFile(f.file);
          setFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'completed', progress: 100, backendId: res.id } : item));
          navigate('/processing');
        } catch (e) {
          setFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'error', progress: 0 } : item));
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Upload Center</h1>
        <p className="text-slate-500 mt-1">Import PDFs and images for local intelligence processing.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ${
          isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
        } flex flex-col items-center justify-center text-center`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Drag & Drop files here</h3>
        <p className="text-slate-500 mb-6 max-w-sm">Support for PDF, JPG, JPEG, and PNG. Maximum file size 50MB for offline processing.</p>
        
        <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transition-colors overflow-hidden group">
          <span className="relative z-10">Browse Files</span>
          <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Ready for Processing ({files.length})</h3>
              <button 
                onClick={startUpload}
                disabled={!files.some(f => f.status === 'pending')}
                className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start Processing Pipeline
              </button>
            </div>
            
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {files.map(file => (
                  <motion.li
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        {file.file.name.endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <FileImage className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-medium text-slate-800 truncate">{file.file.name}</p>
                        <p className="text-xs text-slate-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        
                        {/* Progress Bar */}
                        {file.status !== 'pending' && (
                          <div className="mt-2 w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full ${file.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {file.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {file.status === 'pending' && (
                        <button 
                          onClick={() => removeFile(file.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
