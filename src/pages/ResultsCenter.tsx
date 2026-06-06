import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, FileText, Download, SplitSquareHorizontal, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api, type DocumentDetail } from '../services/api';
import { useLocation } from 'react-router-dom';

const ChatInterface: React.FC<{ documentId: number }> = ({ documentId }) => {
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: "Hi! I'm your AI assistant. I'll use Gemini if you provided an API key, otherwise I'll use the local Llama 3.2 engine." }
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
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-none'}`}>
              {msg.role === 'ai' ? (
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-[15px] leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-2 space-y-1 text-[15px]" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-2 space-y-1 text-[15px]" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2 text-slate-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1 text-slate-900" {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
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
  const [translating, setTranslating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  const handleExportJSON = () => {
    if (!details || !details.results) return;
    const exportData = {
      ...details.results.json_structured,
      raw_text: details.results.raw_text
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = window.document.createElement('a');
    a.href = dataStr;
    a.download = `${details.document.filename.split('.')[0]}_results.json`;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportCSV = () => {
    if (!details || !details.results?.json_structured?.tables?.length) return;
    const tables = details.results.json_structured.tables;
    const keys = Object.keys(tables[0]);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += keys.join(",") + "\r\n";
    tables.forEach((row: any) => {
      const rowData = keys.map(k => {
        const val = row[k] as any;
        const strVal = typeof val === 'object' && val !== null ? val?.value : String(val);
        return `"${(strVal || '').replace(/"/g, '""')}"`;
      });
      csvContent += rowData.join(",") + "\r\n";
    });
    const a = window.document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `${details.document.filename.split('.')[0]}_table.csv`;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
          <div className="relative group">
            <button disabled={translating} className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              {translating ? <Bot className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />} Translate
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {['Hindi', 'Spanish', 'French', 'German'].map(lang => (
                <button 
                  key={lang} 
                  onClick={async () => {
                    setTranslating(true);
                    try {
                      const res = await api.translateDocument(details.document.id, lang);
                      if(res.translated_json) {
                        setDetails({ 
                          ...details, 
                          results: details.results ? { ...details.results, json_structured: res.translated_json } : null
                        });
                      }
                    } catch(e) {}
                    setTranslating(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 first:rounded-t-xl last:rounded-b-xl"
                >
                  To {lang}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleExportJSON} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
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
        <div className="flex-1" />
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${isChatOpen ? 'bg-slate-800 text-white shadow-slate-800/20' : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5'}`}>
          <Bot className="w-4 h-4" /> {isChatOpen ? 'Close Chat' : 'Ask AI Assistant'}
        </button>
      </div>

      <div className="flex-1 flex gap-6 relative flex-row overflow-hidden">
        {splitView && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: isChatOpen ? '40%' : '50%' }}
            className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden relative flex items-center justify-center p-4 transition-all"
          >
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
              Original Document
            </div>
            {document.filename.toLowerCase().endsWith('.pdf') ? (
              <object 
                data={`${import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'}/uploads/${document.filename}`} 
                type="application/pdf"
                className="w-full h-full rounded-xl shadow-sm border border-slate-200/50"
              >
                <p>PDF preview not available. <a href={`${import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'}/uploads/${document.filename}`} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Download</a></p>
              </object>
            ) : (
              <img 
                src={`${import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'}/uploads/${document.filename}`} 
                alt="Original Document" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-slate-200/50"
              />
            )}
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
                    {results.json_structured.document_language && (
                      <p className="text-xs font-semibold text-indigo-600 mb-4 px-3 py-1 bg-indigo-100 inline-block rounded-full">
                        Language: {results.json_structured.document_language}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(results.json_structured.key_fields).map(([k, v]) => (
                        <div key={k} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative">
                          <p className="text-xs text-slate-400 font-medium mb-1">{k}</p>
                          <p className="text-sm text-slate-800 font-semibold">{typeof v === 'object' && v !== null ? (v as any)?.value : String(v)}</p>
                          {typeof v === 'object' && v !== null && (v as any)?.language && (
                            <span className="absolute top-3 right-3 text-[10px] font-bold bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full">
                              {(v as any).language}
                            </span>
                          )}
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
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Extracted Tables</h3>
                      <button onClick={handleExportCSV} className="text-xs flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                    </div>
                    <div className="overflow-x-auto p-4">
                      {typeof results.json_structured.tables[0] === 'object' && !Array.isArray(results.json_structured.tables[0]) ? (
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
                                  <td key={j} className="px-4 py-3 relative">
                                    {typeof val === 'object' && val !== null ? (val as any)?.value : String(val)}
                                    {typeof val === 'object' && val !== null && (val as any)?.language && (
                                      <span className="ml-2 text-[10px] font-bold text-cyan-600">({(val as any).language})</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <pre className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          {JSON.stringify(results.json_structured.tables, null, 2)}
                        </pre>
                      )}
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
                    {results.images.map((img: any, i: number) => {
                      const imgPath = typeof img === 'string' ? img : img.path;
                      const imgDesc = typeof img === 'string' ? `Extracted ${i}` : img.description;
                      return (
                        <div key={i} className="group relative border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <img src={`${import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'}${imgPath}`} alt={imgDesc} className="w-full object-cover" />
                          {typeof img !== 'string' && (
                            <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                              <p className="text-xs font-semibold text-slate-800 text-center">{imgDesc}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
          </div>
        </motion.div>

        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: '400px' }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col z-20"
          >
            <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold">AI Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="flex-1 p-4 bg-slate-50/50">
              <ChatInterface documentId={document.id} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
