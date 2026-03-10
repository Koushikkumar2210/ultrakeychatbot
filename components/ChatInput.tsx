
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, inputRef }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || selectedImage) && !isLoading) {
      onSendMessage(text.trim(), selectedImage || undefined);
      setText('');
      setSelectedImage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(inputRef.current.scrollHeight, 120); // Max height
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, [text, inputRef]);

  return (
    <div className="px-3 py-2 md:px-4 md:py-2.5 bg-transparent border-t border-white/5 pb-safe">
      {selectedImage && (
        <div className="mb-2.5 relative inline-block">
          <img src={selectedImage} alt="Selected" className="h-16 w-16 object-cover rounded-lg border border-white/20" />
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-end space-x-2.5">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
          title="Upload image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </button>
        <div className="flex-1 relative bg-white/10 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 focus-within:bg-white/15 transition-all duration-300 backdrop-blur-3xl overflow-hidden">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-label="Message text area"
            className="w-full bg-transparent text-white px-4 py-2.5 focus:outline-none resize-none overflow-y-auto max-h-[120px] scrollbar-hide text-sm placeholder:text-white/30 leading-tight min-h-[40px]"
            disabled={isLoading}
            rows={1}
          />
        </div>
        <button
          type="submit"
          disabled={(!text.trim() && !selectedImage) || isLoading}
          aria-label={isLoading ? "Sending message..." : "Send message"}
          className={`
            w-9 h-9 rounded-full transition-all duration-500 flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-4 focus:ring-indigo-500/50
            ${(text.trim() || selectedImage) && !isLoading 
              ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:scale-110 active:scale-90' 
              : 'bg-white/5 text-white/10 cursor-not-allowed'}
          `}
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform translate-x-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
      <div className="mt-1.5 flex items-center justify-center space-x-1 opacity-10" aria-hidden="true">
         <span className="text-[7px] text-white uppercase font-black tracking-[0.2em]">Quantum Link Established</span>
      </div>
    </div>
  );
};

export default ChatInput;
