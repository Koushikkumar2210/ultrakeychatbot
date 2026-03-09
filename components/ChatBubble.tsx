
import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Role, Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

type DispatchStatus = 'idle' | 'initiating' | 'dispatching' | 'verifying' | 'sent';

const COMPANY_PHONE = "+91 91234 56789";

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isBot = message.role === Role.BOT;
  const [dispatchStatus, setDispatchStatus] = useState<DispatchStatus>('idle');
  const [progress, setProgress] = useState(0);

  const rawText = message.text || "";
  
  // Detection Logic for System Notification
  const isLeadCapture = rawText.includes('SYSTEM NOTIFICATION') && rawText.includes('📧');
  
  const extractedEmail = useMemo(() => {
    // Look for email in the lead capture block first (usually bolded or after "for ")
    const leadEmailRegex = /Lead confirmed for \**([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\**/i;
    const generalEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    
    const leadMatch = rawText.match(leadEmailRegex);
    if (leadMatch) return leadMatch[1];
    
    const generalMatch = rawText.match(generalEmailRegex);
    return generalMatch ? generalMatch[1] : null;
  }, [rawText]);

  const hasPhone = useMemo(() => rawText.includes(COMPANY_PHONE), [rawText]);

  // Clean the text of internal system flags and lead capture block
  const cleanText = rawText
    .replace(/--- \s*\n\*\*SYSTEM NOTIFICATION:\*\*[^]*$/g, '')
    .replace(/\[ACTION:ENABLE_NAVIGATION\]/g, '')
    .trim();

  // Extract grounding URLs
  const groundingLinks = useMemo(() => {
    const chunks = message.groundingMetadata?.groundingChunks || [];
    const links: { uri: string; title?: string }[] = [];
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) links.push({ uri: chunk.web.uri, title: chunk.web.title });
      if (chunk.maps?.uri) links.push({ uri: chunk.maps.uri, title: chunk.maps.title || 'Google Maps' });
    });
    
    // Filter to only include UltraKey related links
    return Array.from(new Set(links.map(l => l.uri)))
      .map(uri => links.find(l => l.uri === uri)!)
      .filter(link => {
        const title = (link.title || '').toLowerCase();
        const uri = (link.uri || '').toLowerCase();
        return title.includes('ultrakey') || uri.includes('ultrakey');
      });
  }, [message.groundingMetadata]);

  const triggerMailClient = (email: string) => {
    const userPrefix = email.split('@')[0];
    const subject = `UltraKey | Digital Transformation Roadmap for ${userPrefix}`;
    const body = `Hello,\n\nOur Neural Engine at UltraKey IT Solutions has successfully captured your request for digital acceleration.\n\nSTRATEGIC FOCUS AREAS:\n• WEB CORE: High-performance architectures.\n• SEO ENGINE: Dominating search vectors.\n• BRAND DESIGN: UX systems.\n\nOur consultants will provide a comprehensive proposal within 24 hours.\n\nRegards,\nThe UltraKey Core Team\nhttps://ultrakey.in`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleDispatch = () => {
    if (dispatchStatus !== 'idle' || !extractedEmail) return;
    
    setDispatchStatus('initiating');
    setProgress(15);
    
    // Aesthetic simulation of neural processing
    setTimeout(() => { setDispatchStatus('dispatching'); setProgress(50); }, 600);
    setTimeout(() => { setDispatchStatus('verifying'); setProgress(90); }, 1500);
    setTimeout(() => {
      setDispatchStatus('sent');
      setProgress(100);
      triggerMailClient(extractedEmail);
    }, 2200);
  };

  const handleCall = () => { window.location.href = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`; };

  const components = {
    ul: ({ children }: any) => <ul className="space-y-3 my-5 list-none p-0">{children}</ul>,
    li: ({ children }: any) => {
      const content = String(children);
      const lower = content.toLowerCase();
      let icon = null, label = '', color = 'text-indigo-400', bg = 'bg-indigo-500/10';

      if (lower.includes('address:')) {
        icon = <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />;
        label = 'Headquarters'; color = 'text-cyan-400'; bg = 'bg-cyan-500/10';
      } else if (lower.includes('phone:')) {
        icon = <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />;
        label = 'Direct Line'; color = 'text-emerald-400'; bg = 'bg-emerald-500/10';
      } else if (lower.includes('email:')) {
        icon = <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />;
        label = 'Email Sync'; color = 'text-purple-400'; bg = 'bg-purple-500/10';
      }

      if (icon) {
        return (
          <li className="flex items-center space-x-4 p-4 rounded-3xl bg-white/5 border border-white/5 group/item transition-all duration-300 hover:bg-white/10 hover:translate-x-1">
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl ${bg} flex items-center justify-center ${color} shadow-lg group-hover/item:scale-110`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">{icon}</svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-[8px] font-black uppercase tracking-widest ${color} opacity-60 mb-0.5`}>{label}</span>
              <span className="text-white/90 font-bold text-sm truncate">{content.split(':')[1]?.trim() || content}</span>
            </div>
          </li>
        );
      }
      return <li className="mb-2 pl-4 border-l-2 border-indigo-500/20 text-white/70 italic text-sm py-1">{children}</li>;
    }
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-8 px-4 relative group/bubble`}>
      <style>{`
        @keyframes success-bloom { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1.8); opacity: 0; } }
        .bloom { animation: success-bloom 1s ease-out forwards; }
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.6s ease; }
        .shimmer-btn:hover::after { left: 150%; }
      `}</style>

      <div className={`
        relative max-w-[90%] md:max-w-[80%] rounded-[2.5rem] p-5 md:p-6 shadow-2xl transition-all duration-500
        ${isBot ? 'bg-slate-900/95 border border-white/10 rounded-bl-none text-white backdrop-blur-3xl' : 'bg-gradient-to-br from-indigo-600 to-purple-700 border border-white/20 rounded-br-none text-white shadow-indigo-500/20'}
      `}>
        <div className="prose prose-sm md:prose-base prose-invert max-w-none font-medium leading-relaxed">
          {message.image && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
              <img src={message.image} alt="User upload" className="w-full h-auto max-h-[300px] object-contain bg-black/20" />
            </div>
          )}
          <ReactMarkdown components={components as any}>{cleanText || (message.isStreaming ? "..." : "")}</ReactMarkdown>
        </div>

        {isBot && groundingLinks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
            <span className="w-full text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Sources</span>
            {groundingLinks.map((link, idx) => (
              <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[9px] text-indigo-400 font-bold border border-white/5 flex items-center space-x-2 transition-all">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                <span>{link.title || 'Source'}</span>
              </a>
            ))}
          </div>
        )}

        {isBot && (extractedEmail || hasPhone) && !message.isStreaming && (
          <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
             {extractedEmail && (
               <div className={`relative transition-all duration-700 rounded-[2rem] overflow-hidden border p-5 ${dispatchStatus === 'sent' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                  {dispatchStatus === 'sent' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-40 h-40 bg-emerald-500 rounded-full bloom"></div></div>}
                  <div className="flex flex-col space-y-4 relative z-10">
                     <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                           <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${dispatchStatus === 'sent' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-indigo-500/20 text-indigo-400'}`}>
                              {dispatchStatus === 'sent' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-40 truncate">Lead Delivery</span>
                              <span className="text-white text-[11px] font-bold truncate">{extractedEmail}</span>
                           </div>
                        </div>
                        {dispatchStatus === 'idle' && (
                          <button 
                            onClick={handleDispatch} 
                            className="flex-shrink-0 whitespace-nowrap shimmer-btn px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
                          >
                            Dispatch
                          </button>
                        )}
                     </div>
                     {dispatchStatus !== 'idle' && (
                       <div className="space-y-2">
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden"><div className={`h-full transition-all duration-700 ${dispatchStatus === 'sent' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div></div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{dispatchStatus === 'sent' ? 'Deployment Verified' : 'Neural Link Active...'}</span>
                       </div>
                     )}
                  </div>
               </div>
             )}
             {hasPhone && (
               <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-center justify-between gap-3 group/phone">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover/phone:scale-110 transition-transform"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40 truncate">Direct Uplink</span>
                      <span className="text-white text-[11px] font-bold truncate">{COMPANY_PHONE}</span>
                    </div>
                  </div>
                  <button onClick={handleCall} className="flex-shrink-0 whitespace-nowrap shimmer-btn px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105">Call Us</button>
               </div>
             )}
          </div>
        )}
        <div className={`text-[9px] mt-4 font-black uppercase tracking-widest opacity-20 ${isBot ? 'text-left' : 'text-right'}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
};

export default ChatBubble;
