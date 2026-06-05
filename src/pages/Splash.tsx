import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Loader2 } from 'lucide-react';

export const Splash: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden relative">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/20 blur-[120px]"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-400/20 blur-[100px]"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        className="flex flex-col items-center relative z-10"
      >
        <div className="relative mb-8">
          <motion.div 
            className="absolute inset-0 bg-indigo-400 rounded-3xl blur-2xl opacity-40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 border border-white/20 backdrop-blur-sm"
          >
            <Hexagon className="text-white w-12 h-12" strokeWidth={1.5} />
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-5xl font-black tracking-tighter text-slate-800 mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
        >
          Patra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">net</span>
        </motion.h1>
        
        <motion.p 
          className="text-slate-500 font-medium mb-14 text-lg tracking-wide"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Intelligent Document Platform
        </motion.p>

        <motion.div 
          className="flex flex-col items-center gap-4 bg-white/50 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/60 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-600 to-slate-400">Booting Intelligence Engine...</span>
          </div>
          <div className="w-48 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
