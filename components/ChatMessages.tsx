
import React, { useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import ChatBubble from './ChatBubble';

interface ChatMessagesProps {
  messages: Message[];
  onChipClick: (text: string) => void;
  isOpen: boolean;
  botAvatar: string | null;
  onFeedback?: (id: string, feedback: 'positive' | 'negative') => void;
}

const SERVICE_BOXES = [
  { label: "Web Core", icon: "🌐", color: "from-blue-500", text: "I want to know about Web Development services." },
  { label: "Digital Ops", icon: "📱", color: "from-purple-500", text: "Tell me about Digital Marketing services." },
  { label: "Brand Design", icon: "🎨", color: "from-pink-500", text: "I am interested in Graphic Design services." },
  { label: "SEO Engine", icon: "🔍", color: "from-indigo-500", text: "I need help with SEO (Search Engine Optimization)." },
  { label: "Social Hub", icon: "📸", color: "from-cyan-500", text: "Tell me about Social Media Optimization (SMO)." },
  { label: "Ad Systems", icon: "💰", color: "from-yellow-500", text: "I want to run Google Ads." },
  { label: "Accountancy", icon: "⚖️", color: "from-slate-500", text: "I need Chartered Accountant (CA) services." },
  { label: "Mobile Apps", icon: "🚀", color: "from-emerald-500", text: "Tell me about Mobile App Development." },
];

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, onChipClick, isOpen, botAvatar, onFeedback }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    }
  };

  useEffect(() => {
    // Scroll on every message change
    scrollToBottom();
  }, [messages]);

  // Handle initial scroll or visibility changes if needed
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => scrollToBottom(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const showServices = messages.length === 1 && 
                       messages[0].id === 'welcome' && 
                       !messages[0].isStreaming;

  const isEmpty = messages.length === 0;

  return (
    <div 
      ref={scrollRef}
      role="log"
      aria-live="polite"
      className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth custom-scrollbar nebula-bg relative flex flex-col pt-8"
    >
      <style>{`
        @keyframes entrance {
          from { opacity: 0; transform: translateY(40px) scale(0.9); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .animate-entrance { animation: entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        
        .service-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .service-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.05);
        }
      `}</style>

      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-entrance px-6">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse"></div>
            <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center shadow-[0_25px_60px_rgba(79,70,229,0.4)] relative z-10 border border-white/20 group">
              <svg className="w-12 h-12 text-white transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-white font-black text-2xl title-font mb-4 tracking-tight">How can we help?</h3>
          <p className="text-white/50 text-xs font-medium max-w-[280px] leading-relaxed mb-2">
            The UltraKey Neural Core is online and ready to assist you.
          </p>
          <p className="text-indigo-400 text-[10px] uppercase font-black tracking-[0.4em] animate-pulse">
            Start the conversation below
          </p>
        </div>
      )}

      {!isEmpty && messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} botAvatar={botAvatar} onFeedback={onFeedback} />
      ))}

      {showServices && (
        <div className="flex flex-col items-center pt-8 pb-12 px-2 animate-entrance">
          <div className="mb-10 w-full flex items-center justify-center space-x-4">
             <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
             <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.5em] whitespace-nowrap">Service Protocols</p>
             <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-[400px]">
            {SERVICE_BOXES.map((box, i) => (
              <button
                key={i}
                onClick={() => onChipClick(box.text)}
                style={{ animationDelay: `${(i + 1) * 0.08}s` }}
                className="animate-entrance service-card group relative flex flex-col items-center justify-center p-4 rounded-[1.8rem] border border-white/5 active:scale-95"
              >
                <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${box.color} to-transparent opacity-0 group-hover:opacity-20 transition-opacity blur-2xl rounded-full`}></div>
                
                <div className="relative z-10 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-110 group-hover:border-white/20 shadow-inner overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                   <span className="text-xl relative z-10 drop-shadow-lg filter grayscale group-hover:grayscale-0 transition-all duration-500">{box.icon}</span>
                </div>
                
                <span className="text-white/80 font-bold text-[11px] tracking-tight group-hover:text-white transition-colors">
                  {box.label}
                </span>

                <div className="mt-1.5 w-1 h-1 rounded-full bg-white/10 group-hover:bg-white group-hover:scale-150 transition-all duration-500"></div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div ref={endRef} className="h-4 w-full flex-shrink-0" />
    </div>
  );
};

export default ChatMessages;
