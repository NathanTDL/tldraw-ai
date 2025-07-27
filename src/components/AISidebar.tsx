"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Palette, Send, Sparkles, Minimize2, Plus, Zap, User, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp?: Date;
}

interface AISidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export default function AISidebar({ isCollapsed, onToggleCollapse }: AISidebarProps) {
  const { requireAuth } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hello! I'm your Canvas Assistant. How can I help you with your creative projects today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
const [isModelOpen, setIsModelOpen] = useState(false);

const modelOptions = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3", label: "Claude 3" },
  { value: "gemini-pro", label: "Gemini Pro" }
];
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    if (!requireAuth()) return;
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    
    setMessages((prev) => [...prev, { 
      role: "user", 
      content: text
    }]);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI response with more realistic delay
    setTimeout(() => {
      const responses = [
        "That's a great idea! I can help you create something amazing on your canvas.",
        "Interesting! Let me suggest some creative approaches for your project.",
        "I love where this is going! Here are some ways we can enhance your canvas.",
        "Perfect! Let's transform your vision into something extraordinary.",
        "Got it! I'll help you bring structure and creativity to your canvas."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages((prev) => [...prev, { 
        role: "ai", 
        content: randomResponse
      }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const quickActions = [
    { icon: Sparkles, label: "Brainstorm ideas", action: "Help me brainstorm creative ideas" },
    { icon: Zap, label: "Quick template", action: "Show me quick canvas templates" },
    { icon: Plus, label: "Add elements", action: "What elements should I add to my canvas?" }
  ];

  if (isCollapsed) {
    return (
      <div className="fixed bottom-8 right-8 z-50 group">
        {/* Floating Canvas Assistant Button */}
        <div className="relative">
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-slate-400 opacity-10 blur-lg scale-125 group-hover:opacity-20 transition-all duration-500" />
          
          {/* Main Button */}
          <Button
            onClick={() => onToggleCollapse(false)}
            className="relative w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 p-0 overflow-hidden group/button"
          >
            {/* Subtle Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700" />
            
            {/* Canvas Icon */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <Palette className="w-6 h-6 drop-shadow-sm" />
            </div>
          </Button>
          
          {/* Minimal Online Indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
        </div>
        
        {/* Clean Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <div className="bg-slate-800/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-slate-600/20 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-medium">Canvas Assistant</span>
            </div>
            <div className="absolute top-full right-3 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-slate-800/95" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200/30 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 flex flex-col shadow-xl backdrop-blur-2xl">
      {/* Minimalistic Header */}
      <header className="p-4 border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center shadow-md">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Canvas Assistant
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleCollapse(true)}
            className="w-8 h-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 group"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </Button>
        </div>
      </header>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Quick Actions</h3>
          <div className="grid gap-2">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={() => {
                  setInput(action.action);
                  inputRef.current?.focus();
                }}
                className="h-auto p-3 justify-start text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-xl group"
              >
                <action.icon className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
                <div>
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{action.action}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex items-start gap-3 group",
            m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          )}>
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md",
              m.role === 'user' 
                ? 'bg-slate-600 dark:bg-slate-500' 
                : 'bg-slate-700 dark:bg-slate-600'
            )}>
              {m.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Palette className="w-4 h-4 text-white" />
              )}
            </div>
            
            {/* Message Bubble */}
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md",
              m.role === 'user' 
                ? 'bg-slate-600 dark:bg-slate-500 text-white rounded-tr-md' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-md backdrop-blur-sm'
            )}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {m.content}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center shadow-md">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md px-4 py-3 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-4 pr-4 py-4 rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 text-sm placeholder:text-slate-400 resize-none min-h-[120px] max-h-[200px] overflow-y-auto"
              disabled={isTyping}
              rows={4}
            />

            {/* Model selector row */}
            <div className="relative mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModelOpen(!isModelOpen)}
                className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                {modelOptions.find((m) => m.value === selectedModel)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isModelOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-40 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-lg shadow-lg z-20">
                  {modelOptions.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setSelectedModel(m.value);
                        setIsModelOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700',
                        selectedModel === m.value && 'bg-slate-100 dark:bg-slate-700'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
          <Button
            type="submit"
            size="sm"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </aside>
  );
}
