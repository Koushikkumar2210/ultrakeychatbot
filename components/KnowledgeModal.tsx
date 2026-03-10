
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js - using a fixed version for stability
const PDFJS_VERSION = '4.4.168';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}

const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ isOpen, onClose, initialValue, onSave }) => {
  const [value, setValue] = useState(initialValue);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSync = () => {
    if (!value.trim()) return;
    setIsSyncing(true);
    setTimeout(() => {
      onSave(value);
      setIsSyncing(false);
      onClose();
    }, 2400);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF.');
      return;
    }

    setIsParsing(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      
      const cleanedText = fullText.replace(/\s+/g, ' ').trim();
      setValue(prev => (prev ? `${prev}\n\n${cleanedText}` : cleanedText));

    } catch (error) {
      console.error('Error parsing PDF:', error);
      setError('Failed to extract text from PDF. This might be due to a complex layout or encryption. Please paste the text manually.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 backdrop-blur-xl">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan { animation: scan-line 2s ease-in-out infinite; }
        .input-glow:focus-within { box-shadow: 0 0 25px rgba(99, 102, 241, 0.15); border-color: rgba(34, 211, 238, 0.3); }
      `}</style>
      
      <div className="absolute inset-0 bg-slate-950/60" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[380px] bg-[#0f172a]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)] glass-effect animate-in zoom-in-95 duration-300">
        
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_5px_20px_rgba(99,102,241,0.5)]"></div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            <div className="flex flex-col">
              <h3 className="text-white font-black text-lg tracking-tight">Knowledge Core</h3>
              <p className="text-white/40 text-[9px] uppercase font-black tracking-[0.3em] mt-0.5">Train Your Assistant</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing || isSyncing}
            className="px-4 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center space-x-2 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all group"
            title="Upload PDF"
          >
            {isParsing ? (
              <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
              </>
            )}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
        </div>

        <div className="relative mb-8 input-glow group transition-all duration-500">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste documents, FAQs, or context here to train the AI..."
            className={`w-full h-52 bg-white/5 border rounded-3xl p-5 text-white/80 text-sm focus:outline-none transition-all custom-scrollbar resize-none placeholder:text-white/10 font-medium leading-relaxed shadow-inner ${error ? 'border-red-500/50' : 'border-white/10'}`}
            disabled={isSyncing || isParsing}
          />
          
          {(isSyncing || isParsing) && (
            <div className="absolute inset-0 bg-indigo-900/10 rounded-3xl flex flex-col items-center justify-center backdrop-blur-[2px] overflow-hidden border border-cyan-500/30">
               <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 shadow-[0_0_25px_#22d3ee] animate-scan"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    {isParsing ? 'Extracting PDF Data...' : 'Neural Ingestion...'}
                  </p>
               </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-xs font-medium mb-4 animate-in fade-in">{error}</p>}

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleSync}
            disabled={isSyncing || isParsing || !value.trim()}
            className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 transform active:scale-95 ${isSyncing || isParsing || !value.trim() ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 text-white border border-white/20 hover:shadow-[0_20px_40px_rgba(79,70,229,0.4)] hover:-translate-y-1'}`}
          >
            {isSyncing ? 'Processing Signal...' : 'Sync Knowledge'}
          </button>
          
          <button onClick={onClose} className="w-full py-2 text-white/30 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors duration-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeModal;
