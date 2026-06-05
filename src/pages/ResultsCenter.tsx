import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, FileText, Download, SplitSquareHorizontal, Bot } from 'lucide-react';
import { api, type DocumentDetail } from '../services/api';
import { useLocation } from 'react-router-dom';

const ChatInterface: React.FC<{ documentId: number }> = ({ documentId }) => {
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: "Hi! I'm your local Llama 3.2 1B engine. Ask me anything about this document!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const response = await api.sendChatMessage(documentId, msg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error communicating with the local LLM." }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 border border-slate-100 rounded-2xl bg-slate-50 p-4 mb-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-cyan-100 text-cyan-600'}`}>
              {msg.role === 'user' ? 'U' : <Bot className="w-5 h-5" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700' : 'bg-white text-slate-700 rounded-tl-none border-slate-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 text-sm text-slate-500 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="e.g., What is the total amount?" 
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
        />
        <button onClick={handleSend} disabled={loading} className="bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-medium transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};

export const ResultsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('json');
  const [splitView, setSplitView] = useState(false);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docId = searchParams.get('id');

  const [details, setDetails] = useState<DocumentDetail | null>(null);

  useEffect(() => {
    if (docId) {
      api.getDocumentDetails(parseInt(docId)).then(data => {
        setDetails(data);
      });
    } else {
      // Fetch latest document if none specified
      api.getDocuments().then(docs => {
        if (docs.length > 0) {
          api.getDocumentDetails(docs[0].id).then(data => setDetails(data));
        }
      });
    }
  }, [docId]);

  if (!details) {
    return <div className="p-8 text-center text-slate-500">Loading results or no documents found...</div>;
  }

  const { document, results } = details;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{document.filename}</h1>
          <p className="text-slate-500 mt-1">Processed • {document.document_type || 'Unknown Type'}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSplitView(!splitView)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${splitView ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <SplitSquareHorizontal className="w-4 h-4" /> Before & After
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200/50 pb-2">
        <button onClick={() => setActiveTab('json')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'json' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Code className="w-4 h-4" /> Structured JSON
        </button>
        <button onClick={() => setActiveTab('tables')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'tables' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <SplitSquareHorizontal className="w-4 h-4" /> Tables
        </button>
        <button onClick={() => setActiveTab('images')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'images' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Download className="w-4 h-4" /> Images
        </button>
        <button onClick={() => setActiveTab('text')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'text' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <FileText className="w-4 h-4" /> Raw OCR Text
        </button>
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Bot className="w-4 h-4" /> AI Chat
        </button>
      </div>

      <div className={`flex-1 flex gap-6 ${splitView ? 'flex-row' : 'flex-col'}`}>
        {splitView && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '50%' }}
            className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden relative flex items-center justify-center p-4"
          >
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
              Original Document
            </div>
            <img 
              src={`http://localhost:8000/uploads/${document.filename}`} 
              alt="Original Document" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-slate-200/50"
            />
          </motion.div>
        )}

        <motion.div 
          layout
          className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'json' && (
              <div className="space-y-6">
                {results?.json_structured?.key_fields && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Extracted Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(results.json_structured.key_fields).map(([k, v]) => (
                        <div key={k} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <p className="text-xs text-slate-400 font-medium mb-1">{k}</p>
                          <p className="text-sm text-slate-800 font-semibold">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Raw Developer JSON</h3>
                  <pre className="text-xs font-mono text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                    {results ? JSON.stringify(results.json_structured, null, 2) : 'No structured data'}
                  </pre>
                </div>
              </div>
            )}
            
            {activeTab === 'tables' && (
              <div className="space-y-6">
                {results?.json_structured?.tables && results.json_structured.tables.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Extracted Tables</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            {Object.keys(results.json_structured.tables[0]).map(k => (
                              <th key={k} className="px-4 py-3 font-semibold border-b border-slate-100">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {results.json_structured.tables.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              {Object.values(row).map((val: any, j: number) => (
                                <td key={j} className="px-4 py-3">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-10 text-slate-500">
                    <SplitSquareHorizontal className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p>No tables detected in this document.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                {results?.images && results.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {results.images.map((img: string, i: number) => (
                      <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <img src={`http://localhost:8000/${img}`} alt={`Extracted ${i}`} className="w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-10 text-slate-500">
                    <Download className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p>No isolated images or signatures detected in this document.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {results ? results.raw_text : 'No raw text available'}
              </div>
            )}
            {activeTab === 'chat' && (
              <ChatInterface documentId={document.id} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
