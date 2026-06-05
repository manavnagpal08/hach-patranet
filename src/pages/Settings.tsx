import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Cpu, HardDrive, Bell, Globe, Database } from 'lucide-react';

export const Settings: React.FC = () => {
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
              <Cpu className="w-5 h-5 text-blue-500" /> Local LLM Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Active Model</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option>Llama 3.2 1B (Q4_K_M) - Recommended</option>
                  <option>Llama 3.2 3B (Q4_K_M)</option>
                  <option>Phi-3 Mini 4K (Q4_K_M)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Model is loaded on-demand to preserve your 8GB RAM limit.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Context Window</label>
                <input type="range" className="w-full accent-blue-600" min="512" max="4096" defaultValue="2048" />
                <div className="flex justify-between text-xs font-medium text-slate-400 mt-2">
                  <span>512</span>
                  <span>2048 (Current)</span>
                  <span>4096</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">Dynamic Memory Unloading</p>
                  <p className="text-sm text-slate-500">Automatically unloads LLM when idle for 5 mins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-colors">
                Save Configuration
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
