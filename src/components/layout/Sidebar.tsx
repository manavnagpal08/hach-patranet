import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Cpu, LayoutList, Search, Settings, Hexagon, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', path: '/analytics', icon: Cpu },
  { label: 'New Extraction', path: '/upload', icon: UploadCloud },
  { label: 'Document Library', path: '/history', icon: FileText },
  { label: 'Processing', path: '/processing', icon: Cpu },
  { label: 'Results', path: '/results', icon: LayoutList },
  { label: 'Search', path: '/search', icon: Search },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/50">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <Hexagon className="text-white w-5 h-5 absolute" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">
            Patra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">net</span>
          </span>
        </motion.div>
      </div>

      {/* Nav items */}
      <motion.div
        className="flex-1 py-6 px-4 space-y-1 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</div>
        {navItems.map((item) => (
          <motion.div key={item.path} variants={itemVariants}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive ? 'text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-indigo-50/80 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={`absolute inset-0 bg-slate-50/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl ${isActive ? 'hidden' : ''}`} />
                  <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-600'}`} />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Upload CTA */}
      <div className="px-4 pb-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/upload')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </motion.button>
      </div>

      {/* Settings */}
      <div className="p-4 pt-2 border-t border-slate-200/50">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
              isActive ? 'text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute inset-0 bg-indigo-50/80 rounded-xl" />}
              <div className={`absolute inset-0 bg-slate-50/80 translate-y-full hover:translate-y-0 transition-transform duration-300 rounded-xl ${isActive ? 'hidden' : ''}`} />
              <Settings className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'text-indigo-600 rotate-90' : 'text-slate-400 hover:rotate-90'}`} />
              <span className="relative z-10">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
