import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateChatResponse } from '../services/aiService';

export default function Chatbot({ fieldProfile, weatherData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Farm Advisor. Ask me anything about your crops, weather, or farming practices.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await generateChatResponse(newMessages, { fieldProfile, weatherData });
      setMessages([...newMessages, { role: 'assistant', content: responseText }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I encountered an error connecting to the AI. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-hard w-[90vw] sm:w-[350px] h-[500px] max-h-[80vh] flex flex-col mb-4 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-brand-primary text-neutral-surface p-4 flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold text-sm tracking-wide">AI Farm Advisor</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-brand-surface hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-fill/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm overflow-hidden ${
                  msg.role === 'user' 
                    ? 'bg-brand-primary text-white rounded-br-none shadow-sm' 
                    : 'bg-neutral-surface border border-neutral-border text-neutral-high rounded-bl-none shadow-sm prose prose-sm prose-earth max-w-none'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-surface border border-neutral-border text-neutral-medium rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-neutral-medium rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-medium rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-medium rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-neutral-surface border-t border-neutral-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops or weather..."
              className="flex-1 bg-neutral-fill border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-brand-primary hover:bg-brand-secondary text-white rounded-xl px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}

      {/* FAB Button */}
      {!isOpen && (
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOpen(true)}
            className="animate-fade-in bg-neutral-surface border border-neutral-border text-neutral-high text-[13px] font-semibold rounded-full shadow-soft px-3.5 py-2 cursor-pointer hover:bg-neutral-fill transition-colors whitespace-nowrap"
          >
            Ask me anything 🌾
          </button>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Farm Advisor chat"
            className="bg-brand-primary hover:bg-brand-secondary text-white w-14 h-14 rounded-full shadow-hard flex items-center justify-center transition-transform hover:scale-105 cursor-pointer relative shrink-0"
          >
            <span className="text-2xl">🤖</span>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-semantic-high border-2 border-white rounded-full"></span>
          </button>
        </div>
      )}
    </div>
  );
}
