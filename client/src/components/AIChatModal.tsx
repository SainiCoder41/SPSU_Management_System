import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { aiService } from '../services/aiService';
import { IChatMessage } from '../types/ai';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I am SPSU Campus Assistant (v6.0). I can help answer questions regarding campus curfew, hostel mess timings, attendance rules, leave procedures, library hours, emergency numbers, or check your attendance and mentor details.',
      source: 'GENERAL',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMsg: IChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const data = await aiService.sendMessage(userMsg.content);
      const botMsg: IChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        source: data.source,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: IChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error connecting to campus services. Please try again.',
        source: 'GENERAL',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What is the hostel curfew?',
    'What are mess timings today?',
    'What is my current attendance?',
    'Who is my faculty mentor?',
    'Emergency medical contacts',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-spsu-navy to-[#0057B8] px-5 py-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Sparkles size={20} className="text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight leading-tight">SPSU Campus Assistant</h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded font-semibold">
                  v6.0 AI
                </span>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                <Shield size={11} /> Contextual & Privacy-Guarded (AI-006)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-sm">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-spsu-lightBlue text-spsu-blue flex items-center justify-center shrink-0 border border-blue-200">
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-xs ${
                    isUser
                      ? 'bg-spsu-blue text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line leading-relaxed'
                  }`}
                >
                  <p>{m.content}</p>
                  <div
                    className={`mt-1.5 text-[10px] flex items-center justify-between gap-2 ${
                      isUser ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && m.source && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        {m.source === 'STUDENT_CONTEXT' ? '• Personal Context' : m.source === 'KB' ? '• Verified KB' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-spsu-lightBlue text-spsu-blue flex items-center justify-center shrink-0 border border-blue-200">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-2 text-slate-500">
                <RefreshCw size={14} className="animate-spin text-spsu-blue" />
                <span className="text-xs">Checking university knowledge base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputValue(p);
              }}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about curfew, mess, leaves, attendance..."
            className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8] focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="bg-spsu-blue text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
