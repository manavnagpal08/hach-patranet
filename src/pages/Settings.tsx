import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Cpu, HardDrive, Database, Key, Trash2, Download } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [activeEngine, setActiveEngine] = useState('local');
  const [ocrEngine, setOcrEngine] = useState('easyocr');
  const [dbSize, setDbSize] = useState('Checking...');

  useEffect(() => {
    const savedGemini = localStorage.getItem('gemini_api_key');
    if (savedGemini) setGeminiKey(savedGemini);
    
    const savedGroq = localStorage.getItem('groq_api_key');
    if (savedGroq) setGroqKey(savedGroq);
    
    const savedEngine = localStorage.getItem('active_engine');
    if (savedEngine) setActiveEngine(savedEngine);

    const savedOcr = localStorage.getItem('ocr_engine');
    if (savedOcr) setOcrEngine(savedOcr);

    // Mock DB size check
    setTimeout(() => setDbSize('42.8 MB used of 10 GB limit'), 1000);
  }, []);

  const handleSaveAI = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('groq_api_key', groqKey);
    localStorage.setItem('active_engine', activeEngine);
    alert('AI Settings saved successfully!');
  };

  const handleSaveOCR = () => {
    localStorage.setItem('ocr_engine', ocrEngine);
    alert('OCR Settings saved successfully!');
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all documents and extractions? This cannot be undone.")) {
      // In a real app this would call the API
      alert("All data cleared successfully.");
      setDbSize('0.0 MB used of 10 GB limit');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage local AI models, OCR configuration, and storage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl text-left transition-colors ${activeTab === 'ai' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Cpu className={`w-5 h-5 ${activeTab === 'ai' ? 'text-indigo-600' : 'text-slate-400'}`} /> AI Models
          </button>
          <button 
            onClick={() => setActiveTab('ocr')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl text-left transition-colors ${activeTab === 'ocr' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <SettingsIcon className={`w-5 h-5 ${activeTab === 'ocr' ? 'text-indigo-600' : 'text-slate-400'}`} /> OCR Engine
          </button>
          <button 
            onClick={() => setActiveTab('storage')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl text-left transition-colors ${activeTab === 'storage' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <HardDrive className={`w-5 h-5 ${activeTab === 'storage' ? 'text-indigo-600' : 'text-slate-400'}`} /> Storage
          </button>
          <button 
            onClick={() => setActiveTab('export')}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl text-left transition-colors ${activeTab === 'export' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Database className={`w-5 h-5 ${activeTab === 'export' ? 'text-indigo-600' : 'text-slate-400'}`} /> Export Data
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'ai' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" /> AI Engine Configuration
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Active Processing Engine</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveEngine('local')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeEngine === 'local' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Local Llama</button>
                    <button onClick={() => setActiveEngine('groq')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeEngine === 'groq' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Groq Cloud</button>
                    <button onClick={() => setActiveEngine('gemini')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeEngine === 'gemini' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Gemini API</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Groq API Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-slate-400" /></div>
                    <input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gemini API Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Key className="h-5 w-5 text-slate-400" /></div>
                    <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIza..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={handleSaveAI} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-colors">Save Configuration</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'ocr' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-indigo-500" /> OCR Engine Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Primary Text Extractor</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setOcrEngine('easyocr')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${ocrEngine === 'easyocr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>EasyOCR (Fast)</button>
                    <button onClick={() => setOcrEngine('tesseract')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${ocrEngine === 'tesseract' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tesseract (Accurate)</button>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={handleSaveOCR} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-colors">Save Configuration</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'storage' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-500" /> Storage Management
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Local SQLite Database</h3>
                <p className="text-2xl font-bold text-slate-900">{dbSize}</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '4.2%' }}></div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={handleClearData} className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-medium px-6 py-2.5 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" /> Clear All Data
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" /> Export Data
              </h2>
              <p className="text-slate-600 mb-6">Download a complete backup of all your locally processed documents and structured data.</p>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group">
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700">Export Raw Database (SQLite)</h3>
                    <p className="text-sm text-slate-500">Full backup of patranet.db</p>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group">
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700">Export All Extractions (JSON)</h3>
                    <p className="text-sm text-slate-500">A massive zip file containing all JSON data</p>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

