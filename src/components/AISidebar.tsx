"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useCanvas } from "@/contexts/CanvasProvider";
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
  const { editorRef, registerEditor } = useCanvas();

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hello! I'm your Canvas Assistant. How can I help you with your creative projects today?"
    }
  ]);
  
  // Method to get canvas snapshot
  const getCanvasSnapshot = () => {
    if (!editorRef.current) return null;
    return editorRef.current.store.getSnapshot();
  };

  // Method to parse shapes from snapshot
  const parseShapes = (snapshot: any) => {
    if (!snapshot || !snapshot.store) return [];
    
    const shapes = [];
    const records = snapshot.store;
    
    // Extract shape records from the store
    for (const [id, record] of Object.entries(records)) {
      if (typeof record === 'object' && record && (record as any).typeName === 'shape') {
        const shape = record as any;
        shapes.push({
          id: shape.id,
          type: shape.type,
          x: shape.x,
          y: shape.y,
          rotation: shape.rotation,
          props: shape.props,
          // Extract text content if available
          text: shape.props?.text || '',
          // For geometric shapes, include dimensions
          width: shape.props?.w,
          height: shape.props?.h,
        });
      }
    }
    
    return shapes;
  };
  
  // Method to transform canvas data to natural language
  const transformToNaturalLanguage = (shapes: any[]) => {
    if (shapes.length === 0) {
      return "The canvas is currently empty.";
    }
    
    let description = `The canvas contains ${shapes.length} element(s):\n\n`;
    
    shapes.forEach((shape, index) => {
      description += `${index + 1}. ${shape.type} `;
      if (shape.text) {
        description += `with text: "${shape.text}" `;
      }
      description += `at position (${Math.round(shape.x)}, ${Math.round(shape.y)})`;
      if (shape.width && shape.height) {
        description += ` with dimensions ${Math.round(shape.width)}x${Math.round(shape.height)}`;
      }
      description += "\n";
    });
    
    return description;
  };
  
  // Method to get canvas context for AI
  const getCanvasContext = () => {
    const snapshot = getCanvasSnapshot();
    const shapes = parseShapes(snapshot);
    const naturalLanguageDescription = transformToNaturalLanguage(shapes);
    
    return {
      snapshot,
      shapes,
      description: naturalLanguageDescription,
      shapeCount: shapes.length
    };
  };
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash-exp");
const [isModelOpen, setIsModelOpen] = useState(false);

const modelOptions = [
  { value: "gemini-2.0-flash-exp", label: "Gemini Flash (Active)" },
  { value: "gpt-4", label: "GPT-4 (Coming Soon)" },
  { value: "claude-3", label: "Claude 3 (Coming Soon)" }
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && input.trim()) {
        e.preventDefault();
        const form = document.getElementById('ai-chat-form') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
      
      // Escape to focus on input
      if (e.key === 'Escape' && !isCollapsed) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [input, isCollapsed]);

const handleSend = async (e: FormEvent) => {
    if (!requireAuth()) return;
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage) return;
    
    setMessages((prev) => [...prev, { 
      role: "user", 
      content: userMessage
    }]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Get the current canvas context
      const context = getCanvasContext();
      
      // Get conversation history (last 5 messages for context)
      const conversationHistory = messages.slice(-5);
      
      // Call our API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: context.description,
          conversationHistory: conversationHistory
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          content: data.message
        }]);
      } else {
        // Fallback response if API fails
        setMessages((prev) => [...prev, { 
          role: "ai", 
          content: data.message || "I'm having trouble right now, but I'm here to help with your canvas!"
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response for network errors
      setMessages((prev) => [...prev, { 
        role: "ai", 
        content: "I'm having connection issues, but I can see your canvas! Let me try to help based on what's currently displayed."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Dynamic quick actions based on canvas state
  const getQuickActions = () => {
    const context = getCanvasContext();
    
    if (context.shapeCount === 0) {
      // Canvas is empty
      return [
        { icon: Sparkles, label: "Get started", action: "How should I start organizing my ideas on this canvas?" },
        { icon: Zap, label: "Templates", action: "Show me some canvas templates to get started" },
        { icon: Plus, label: "First steps", action: "What's the best way to begin a new project on this canvas?" }
      ];
    } else {
      // Canvas has content
      return [
        { icon: Sparkles, label: "Analyze canvas", action: "What do you think of my current canvas layout?" },
        { icon: Zap, label: "Improve", action: "How can I improve and organize what's on my canvas?" },
        { icon: Plus, label: "Next steps", action: "What should I add next to complete this project?" }
      ];
    }
  };
  
  const quickActions = getQuickActions();

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
      <form id="ai-chat-form" onSubmit={handleSend} className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
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
