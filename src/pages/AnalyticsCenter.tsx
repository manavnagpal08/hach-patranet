import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { api, type Document } from '../services/api';
import { Loader2, TrendingUp, Languages, FileText, CheckCircle2 } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#8b5cf6'];

export const AnalyticsCenter: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDocuments().then(data => {
      setDocuments(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Calculate Mock/Real Data for charts
  const typeData = documents.reduce((acc: any, doc) => {
    const type = doc.document_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(typeData).map(key => ({
    name: key,
    value: typeData[key]
  }));

  // Mock Language Data (since we are just adding it)
  const langData = [
    { name: 'English', count: Math.max(1, documents.length - 2) },
    { name: 'Hindi', count: 1 },
    { name: 'Spanish', count: 1 },
  ];

  // Timeline Data
  const timeData = documents.map((doc, i) => ({
    name: new Date(doc.created_at).toLocaleDateString(),
    uploads: 1 + i,
  })).slice(-7); // Last 7 days mock

  const successDocs = documents.filter(d => d.status === 'Completed');
  const successRate = documents.length ? Math.round((successDocs.length / documents.length) * 100) : 0;
  
  // Calculate Average Processing Time
  let totalTimeMs = 0;
  let validTimeDocs = 0;
  successDocs.forEach(doc => {
    if (doc.created_at && doc.completed_at) {
      const created = new Date(doc.created_at).getTime();
      const completed = new Date(doc.completed_at).getTime();
      const diff = completed - created;
      if (diff > 0 && diff < 300000) { // sanity check < 5 mins
        totalTimeMs += diff;
        validTimeDocs++;
      }
    }
  });
  
  const avgTimeSec = validTimeDocs > 0 ? (totalTimeMs / validTimeDocs / 1000).toFixed(1) : '0';
  
  // Estimate Cloud Savings ($0.05 per doc on Enterprise APIs)
  const savings = (documents.length * 0.05).toFixed(2);

  return (
    <div className="space-y-8 pb-8 relative z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Intelligence Analytics</h1>
        <p className="text-slate-500 mt-1">Deep insights into your document processing pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm font-medium text-slate-500 mb-1 relative z-10">Total Processed</p>
          <h3 className="text-3xl font-bold text-slate-800 relative z-10">{documents.length}</h3>
          <TrendingUp className="w-8 h-8 text-indigo-500 absolute bottom-6 right-6 opacity-20 transform group-hover:scale-110 transition-transform" />
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm font-medium text-slate-500 mb-1 relative z-10">Avg Speed (sec)</p>
          <h3 className="text-3xl font-bold text-slate-800 relative z-10">{avgTimeSec}s</h3>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 absolute bottom-6 right-6 opacity-20 transform group-hover:scale-110 transition-transform" />
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm font-medium text-slate-500 mb-1 relative z-10">API Savings</p>
          <h3 className="text-3xl font-bold text-slate-800 relative z-10">${savings}</h3>
          <Languages className="w-8 h-8 text-cyan-500 absolute bottom-6 right-6 opacity-20 transform group-hover:scale-110 transition-transform" />
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm font-medium text-slate-500 mb-1 relative z-10">Success Rate</p>
          <h3 className="text-3xl font-bold text-slate-800 relative z-10">{successRate}%</h3>
          <FileText className="w-8 h-8 text-purple-500 absolute bottom-6 right-6 opacity-20 transform group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6">Processing Volume (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6">Document Types</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length ? pieData : [{name: 'None', value: 1}]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6">Detected Languages Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={langData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
