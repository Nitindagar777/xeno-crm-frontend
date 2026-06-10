import React, { useEffect, useRef, useState } from 'react';
import { useAgent } from '../../context/AgentContext';
import AgentMessage from './AgentMessage';
import { X, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function AgentPanel() {
  const {
    isOpen,
    closePanel,
    messages,
    agentContext,
    isLoading,
    suggestions,
    sendToAgent,
    clearMessages
  } = useAgent();

  const [inputVal, setInputVal] = useState('');
  const threadEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle send message
  const handleSend = () => {
    if (!inputVal.trim()) return;
    sendToAgent(inputVal);
    setInputVal('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectSuggestion = (prompt) => {
    setInputVal(prompt);
  };

  return (
    <div
      className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-[420px] bg-surface-card border-l border-border flex flex-col z-40 transition-transform duration-300 shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-border bg-surface-elevated/20">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="p-2 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            {/* Status dot */}
            <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-surface-card ${
              isLoading ? 'bg-warning animate-pulse' : 'bg-success'
            }`} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary">AI Campaign Agent</span>
            <span className="text-[10px] text-text-muted font-medium tracking-wide uppercase">Powered by Gemini</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors flex items-center space-x-1"
              title="Reset conversation"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={closePanel}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 select-text">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-primary animate-pulse-slow">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h5 className="text-sm font-semibold text-text-primary">Intelligent Campaign Orchestrator</h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                Provide marketing goals like: "Target shoppers who spent over ₹5,000 but haven't purchased in 30 days."
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <AgentMessage
              key={msg.id}
              message={msg}
              isLast={index === messages.length - 1}
            />
          ))
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Suggestion Chips */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-6 py-2 bg-surface-elevated/10 border-t border-border/40 overflow-x-auto flex space-x-2 scrollbar-none whitespace-nowrap">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => selectSuggestion(sug.prompt)}
              className="inline-flex items-center text-[10px] text-text-secondary bg-surface-elevated border border-border/80 px-2.5 py-1.5 rounded-lg hover:bg-surface-card hover:text-primary-light transition-colors hover:border-primary/20"
              title={sug.prompt}
            >
              {sug.title}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-border bg-surface-elevated/25">
        <div className="flex items-center space-x-2 bg-surface border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 rounded-xl px-3 py-1.5 transition-all">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isLoading ? 'Agent is thinking...' : 'Tell me what campaign to run...'}
            disabled={isLoading}
            className="flex-1 max-h-24 min-h-[40px] h-10 py-2.5 bg-transparent border-0 text-text-primary text-xs placeholder-text-muted focus:ring-0 focus:outline-none resize-none scrollbar-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputVal.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex-shrink-0"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
