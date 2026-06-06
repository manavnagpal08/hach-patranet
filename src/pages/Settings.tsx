import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Cpu, HardDrive, Database, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [activeEngine, setActiveEngine] = useState('local');

  useEffect(() => {
    const savedGemini = localStorage.getItem('gemini_api_key');
    if (savedGemini) setGeminiKey(savedGemini);
    
    const savedGroq = localStorage.getItem('groq_api_key');
    if (savedGroq) setGroqKey(savedGroq);
    
    const savedEngine = localStorage.getItem('active_engine');
    if (savedEngine) setActiveEngine(savedEngine);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('groq_api_key', groqKey);
    localStorage.setItem('active_engine', activeEngine);
    // Visual feedback could be added here
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
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 font-medium rounded-xl text-left transition-colors">
            <Cpu className="w-5 h-5" /> AI Models
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-left transition-colors">
            <SettingsIcon className="w-5 h-5 text-slate-400" /> OCR Engine
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-left transition-colors">
            <HardDrive className="w-5 h-5 text-slate-400" /> Storage
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-left transition-colors">
            <Database className="w-5 h-5 text-slate-400" /> Export Data
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" /> AI Engine Configuration
            </h2>
            
            <div className="space-y-8">
              
              {/* Engine Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Active Processing Engine</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveEngine('local')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeEngine === 'local' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Local Llama
                  </button>
                  <button 
                    onClick={() => setActiveEngine('groq')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeEngine === 'groq' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Groq Cloud
                  </button>
                  <button 
                    onClick={() => setActiveEngine('gemini')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeEngine === 'gemini' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Gemini API
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Groq API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Required for Groq Cloud. Get it for free at console.groq.com</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gemini API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Required for Gemini API processing.</p>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-colors">
                Save Configuration
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
