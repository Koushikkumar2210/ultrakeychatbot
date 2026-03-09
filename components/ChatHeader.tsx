
import React from 'react';

interface ChatHeaderProps {
  onReset: () => void;
  onOpenKnowledge: () => void;
  isOnline: boolean;
  hasKnowledge: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset, onOpenKnowledge, isOnline, hasKnowledge }) => {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 relative overflow-hidden backdrop-blur-3xl bg-slate-950/40">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.3); opacity: 0.8; }
          80%, 100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes neural-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes flow-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes activity-wave {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.8); opacity: 1; }
        }
        .animate-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-neural-spin { animation: neural-rotate 10s linear infinite; }
        .animate-wave { animation: activity-wave 1.5s ease-in-out infinite; }
        .knowledge-glow {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 12px rgba(34, 211, 238, 0.2);
        }
      `}</style>

      {/* Decorative flow line across the header */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent">
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-[flow-line_3s_linear_infinite]"></div>
      </div>

      <div className="flex items-center space-x-3 relative z-10">
        <div className="relative group">
          {/* Main Icon Container */}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xl transition-all duration-700 relative overflow-hidden
            ${isOnline 
              ? (hasKnowledge 
                  ? 'bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 knowledge-glow scale-105' 
                  : 'bg-gradient-to-br from-indigo-600 to-slate-800 border border-white/10')
              : 'bg-slate-900 grayscale opacity-40 border border-white/5'
            }
          `}>
            {/* Spinning background effect for Knowledge mode */}
            {hasKnowledge && isOnline && (
              <div className="absolute inset-0 opacity-20 animate-neural-spin">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-white/40 blur-[2px]"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-white/40 blur-[2px]"></div>
              </div>
            )}

            {hasKnowledge ? (
              <svg className="w-6 h-6 relative z-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          
          {/* Advanced Status Indicator */}
          {isOnline ? (
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${hasKnowledge ? 'bg-cyan-400' : 'bg-emerald-500'} border-[3px] border-slate-950 relative z-10 shadow-lg`}></div>
              <div className={`absolute w-8 h-8 rounded-full ${hasKnowledge ? 'bg-cyan-400/40' : 'bg-emerald-500/40'} animate-ring`}></div>
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-[3px] border-slate-950 rounded-full shadow-lg">
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1.5 h-[1px] bg-white rotate-45"></div>
                 <div className="w-1.5 h-[1px] bg-white -rotate-45 absolute"></div>
               </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h1 className="text-white font-black text-sm title-font tracking-tight uppercase">
              UltraKey <span className={`transition-all duration-700 ${hasKnowledge && isOnline ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-indigo-400'}`}>Core</span>
            </h1>
            {hasKnowledge && isOnline && (
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[7px] font-black uppercase tracking-tighter">Enhanced</span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <div className="flex items-center space-x-[2px] h-2">
                  <div className="w-[1.5px] h-2 bg-emerald-500/40 animate-wave" style={{ animationDelay: '0s' }}></div>
                  <div className="w-[1.5px] h-2 bg-emerald-500/60 animate-wave" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-[1.5px] h-2 bg-emerald-500/80 animate-wave" style={{ animationDelay: '0.4s' }}></div>
                </div>
              ) : (
                <div className="w-1 h-1 rounded-full bg-red-500"></div>
              )}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isOnline ? (hasKnowledge ? 'text-cyan-400/80' : 'text-emerald-500/80') : 'text-red-500/60'}`}>
              {isOnline ? (hasKnowledge ? 'Neural Sync Active' : 'Uplink Established') : 'Core Offline'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 relative z-10">
        <button 
          onClick={onOpenKnowledge}
          aria-label="Manage knowledge core"
          className={`
            group/btn w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-500 relative overflow-hidden
            ${hasKnowledge 
              ? 'text-cyan-400 bg-cyan-400/5 border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
              : 'text-white/20 bg-white/5 border-white/5 hover:text-white hover:border-white/20'
            }
          `}
          title="Neural Training"
        >
          {hasKnowledge && <div className="absolute inset-0 bg-cyan-400/5 group-hover/btn:bg-cyan-400/10 transition-colors"></div>}
          <svg className="w-5 h-5 relative z-10 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <button 
          onClick={onReset}
          aria-label="Full Reboot"
          className="group/reset w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/20 border border-white/5 hover:text-red-400 hover:border-red-400/20 transition-all duration-500"
          title="Full Reboot"
        >
          <svg className="w-5 h-5 transition-transform group-hover/reset:rotate-180 duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
