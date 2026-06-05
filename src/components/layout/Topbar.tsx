import React from 'react';
import { Bell, Menu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <motion.h1 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-bold text-slate-800 hidden sm:flex items-center gap-2"
        >
          Patranet Workspace
        </motion.h1>
      </div>
      
      <div className="flex items-center gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-2 border border-emerald-200/50 shadow-sm cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Engine Online
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </motion.button>
      </div>
    </header>
  );
};
