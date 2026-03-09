
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Role, Message, ChatState } from './types';
import { GeminiService } from './services/geminiService';
import ChatHeader from './components/ChatHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import KnowledgeModal from './components/KnowledgeModal';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    knowledgeBase: localStorage.getItem('ultrakey_knowledge') || "",
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatState.error) {
      const timer = setTimeout(() => {
        setChatState(prev => ({ ...prev, error: null }));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [chatState.error]);

  useEffect(() => {
    if (isOpen && !hasGreeted && chatState.messages.length === 0) {
      const fullText = "Welcome to **UltraKey IT Solutions**! 🚀\n\nNeural link established. How can we help you scale your business today?";
      const welcomeMsg: Message = { id: 'welcome', role: Role.BOT, text: '', timestamp: new Date(), isStreaming: true };
      
      const startTimer = setTimeout(() => {
        setChatState(prev => ({ ...prev, messages: [welcomeMsg] }));
        let currentText = '', index = 0;
        const intervalId = setInterval(() => {
          if (index < fullText.length) {
            currentText += fullText[index++];
            setChatState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === 'welcome' ? { ...m, text: currentText } : m)
            }));
          } else {
            clearInterval(intervalId);
            setChatState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === 'welcome' ? { ...m, isStreaming: false } : m)
            }));
            setHasGreeted(true);
          }
        }, 12);
        return () => clearInterval(intervalId);
      }, 800);
      return () => clearTimeout(startTimer);
    }
  }, [isOpen, hasGreeted, chatState.messages.length]);

  const handleSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: Role.USER, 
      text, 
      timestamp: new Date(),
      image 
    };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage], isLoading: true, error: null }));

    const botMsgId = (Date.now() + 1).toString();
    const botMessage: Message = { id: botMsgId, role: Role.BOT, text: '', timestamp: new Date(), isStreaming: true };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, botMessage] }));

    try {
      const service = GeminiService.getInstance();
      let fullResponse = '';

      for await (const chunk of service.sendMessageStream(text, image)) {
        if (chunk.type === 'text') {
          fullResponse += chunk.data;
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => msg.id === botMsgId ? { ...msg, text: fullResponse } : msg)
          }));
        } else if (chunk.type === 'grounding') {
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => msg.id === botMsgId ? { ...msg, groundingMetadata: chunk.data } : msg)
          }));
        }
      }

      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => msg.id === botMsgId ? { ...msg, isStreaming: false } : msg),
        isLoading: false
      }));
    } catch (err: any) {
      setChatState(prev => ({ ...prev, isLoading: false, error: "Neural uplink failure." }));
    }
  }, []);

  const handleReset = useCallback(() => {
    GeminiService.getInstance().resetChat();
    setChatState(prev => ({ ...prev, messages: [], isLoading: false, error: null }));
    setHasGreeted(false);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2147483647] flex flex-col items-end justify-end p-0 md:p-8">
      <div className={`
        transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) transform origin-bottom-right pointer-events-auto
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-20 pointer-events-none'}
        w-full h-full md:w-[360px] md:h-[calc(100vh-6rem)] md:max-h-[850px] md:mb-6
        flex flex-col shadow-2xl md:rounded-[3rem] overflow-hidden glass-effect border-t md:border border-white/10 relative
        bg-slate-950/90 backdrop-blur-3xl
      `}>
        
        <ChatHeader onReset={handleReset} onOpenKnowledge={() => setIsKnowledgeOpen(true)} isOnline={!chatState.error} hasKnowledge={!!chatState.knowledgeBase} />
        <ChatMessages messages={chatState.messages} onChipClick={handleSendMessage} isOpen={isOpen} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} inputRef={inputRef} />
        
        {/* Mobile Close Button (only visible on mobile when open) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <KnowledgeModal isOpen={isKnowledgeOpen} onClose={() => setIsKnowledgeOpen(false)} initialValue={chatState.knowledgeBase} onSave={(val) => {
          GeminiService.getInstance().setKnowledge(val);
          setChatState(prev => ({ ...prev, knowledgeBase: val, messages: [] }));
          setHasGreeted(false);
          setIsKnowledgeOpen(false);
        }} />
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`
          fixed bottom-6 right-6 md:relative md:bottom-0 md:right-0
          w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 pointer-events-auto z-[2147483648]
          ${isOpen ? 'bg-slate-900 rotate-[360deg] md:scale-100 scale-0' : 'bg-gradient-to-br from-indigo-600 to-pink-600 scale-100'}
        `}
      >
        <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </button>
    </div>
  );
};

export default App;
