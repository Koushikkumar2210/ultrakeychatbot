
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

  const cannedResponses: { [key: string]: string } = {
    "I want to know about Web Development services.": "Certainly! Our Web Core services include everything from front-end development using modern frameworks like React and Vue, to robust back-end solutions with Node.js and Python. We build responsive, high-performance websites tailored to your business needs.",
    "Tell me about Digital Marketing services.": "Our Digital Ops team can help you with a wide range of marketing services, including social media campaigns, content marketing, email marketing, and pay-per-click advertising. We focus on data-driven strategies to boost your online presence.",
    "I am interested in Graphic Design services.": "Great! Our Brand Design services cover logo design, branding guidelines, marketing materials, and UI/UX design. We aim to create a strong visual identity that resonates with your target audience.",
    "I need help with SEO (Search Engine Optimization).": "Our SEO Engine services are designed to improve your website's visibility on search engines. We perform keyword research, on-page and off-page optimization, technical SEO audits, and content strategy to drive organic traffic.",
    "Tell me about Social Media Optimization (SMO).": "With our Social Hub services, we optimize your social media profiles and content to increase brand awareness and engagement. We manage platforms like Instagram, Facebook, Twitter, and LinkedIn to build a strong community around your brand.",
    "I want to run Google Ads.": "Our Ad Systems experts can create and manage effective Google Ads campaigns for you. We handle everything from keyword selection and ad copy creation to bid management and performance tracking to maximize your ROI.",
    "I need Chartered Accountant (CA) services.": "We provide professional accountancy services, including bookkeeping, tax preparation, financial auditing, and business advisory. Our certified CAs ensure your finances are in order and compliant with regulations.",
    "Tell me about Mobile App Development.": "Of course! We specialize in creating custom mobile applications for both iOS and Android platforms. Our team handles the entire process from UI/UX design to development, testing, and deployment. What kind of app are you thinking of building?",
  };

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

    if (text === "Where is your office located?") {
      const address = "Flat No: 204, 2nd Floor, Cyber Residency, above Indian Bank, Indira Nagar, Gachibowli, Hyderabad, Telangana 500032";
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, '_blank');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.BOT,
        text: 'Opening our location in Google Maps!',
        timestamp: new Date(),
        isStreaming: false
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage, botMessage],
        isLoading: false
      }));

      return;
    }
    
    const botMsgId = (Date.now() + 1).toString();
    const botMessage: Message = { id: botMsgId, role: Role.BOT, text: '', timestamp: new Date(), isStreaming: true };

    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage, botMessage], isLoading: true, error: null }));

    const cannedResponse = cannedResponses[text as keyof typeof cannedResponses];

    if (cannedResponse) {
      let currentText = '';
      let index = 0;
      const intervalId = setInterval(() => {
        if (index < cannedResponse.length) {
          currentText += cannedResponse[index++];
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(m => m.id === botMsgId ? { ...m, text: currentText } : m)
          }));
        } else {
          clearInterval(intervalId);
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(m => m.id === botMsgId ? { ...m, isStreaming: false } : m),
            isLoading: false
          }));
        }
      }, 12);
      return;
    }

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
  }, [chatState.knowledgeBase]);

  const handleReset = useCallback(() => {
    GeminiService.getInstance().resetChat();
    setChatState(prev => ({ ...prev, messages: [], isLoading: false, error: null }));
    setHasGreeted(false);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2147483647] flex flex-col items-end justify-end p-0 md:p-4">
      <div className={`
        transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) transform origin-bottom-right pointer-events-auto
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-16 pointer-events-none'}
        w-full h-full md:w-[360px] md:h-[calc(100vh-5rem)] md:max-h-[700px] md:mb-4
        flex flex-col shadow-2xl md:rounded-[2.5rem] overflow-hidden glass-effect border-t md:border border-white/10 relative
        bg-slate-950/90 backdrop-blur-3xl
      `}>
        
        <ChatHeader onReset={handleReset} onOpenKnowledge={() => setIsKnowledgeOpen(true)} isOnline={true} hasKnowledge={!!chatState.knowledgeBase} />
        <ChatMessages messages={chatState.messages} onChipClick={handleSendMessage} isOpen={isOpen} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} inputRef={inputRef} />
        
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all z-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
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
        aria-label="Toggle chat window"
        className={`
          fixed bottom-4 right-4 md:relative md:bottom-0 md:right-0
          w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 pointer-events-auto z-[2147483648]
          ${isOpen ? 'bg-slate-900 rotate-[360deg] md:scale-100 scale-0' : 'bg-gradient-to-br from-indigo-600 to-pink-600 scale-100'}
        `}
      >
        <svg className={`h-7 w-7 text-white transition-all duration-500 ${isOpen ? 'transform -rotate-[360deg]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen 
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          }
        </svg>
      </button>
    </div>
  );
};

export default App;
