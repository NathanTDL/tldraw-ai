"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useCanvas } from "@/contexts/CanvasProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Palette, Send, Sparkles, Minimize2, Plus, Zap, User, MessageSquare, ChevronDown, Image, Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "ai";
  content: string;
  images?: { data: string; mimeType: string }[]; // Added to support images
  timestamp?: Date;
}

interface AISidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
}

export default function AISidebar({ isCollapsed, onToggleCollapse, isMobile = false }: AISidebarProps) {
  const { requireAuth } = useAuth();
  const { editorRef, registerEditor } = useCanvas();
  const [uploadedImages, setUploadedImages] = useState<{ data: string; mimeType: string }[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Method to handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imagePromises = files.map(file => {
        return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve({ 
                data: (reader.result as string).split(',')[1], // Get base64 part
                mimeType: file.type 
              });
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then(newImages => {
        setUploadedImages(prev => [...prev, ...newImages]);
      });
    }
  };

  // Method to remove an uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Method to add an image to the canvas
  const addImageToCanvas = ({ imageData, position }: { imageData: string; position?: { x: number; y: number } }) => {
    if (!editorRef.current) {
      console.error('Editor not available');
      return;
    }

    let finalPosition = position;
    if (!finalPosition) {
      const viewport = editorRef.current.getViewportScreenBounds();
      finalPosition = {
        x: viewport.x + viewport.w / 2,
        y: viewport.y + viewport.h / 2,
      };
    }

    try {
      const assetId = `asset:${Date.now()}`;
      const shapeId = `shape:image_${Date.now()}`;
      const imageUrl = `data:image/png;base64,${imageData}`;

      // Create the asset first
      const asset = {
        id: assetId,
        type: 'image' as const,
        typeName: 'asset' as const,
        props: {
          name: 'Generated Image',
          src: imageUrl,
          w: 512,
          h: 512,
          mimeType: 'image/png',
          isAnimated: false,
        },
        meta: {},
      };

      // Create the shape
      const shape = {
        id: shapeId,
        type: 'image' as const,
        typeName: 'shape' as const,
        x: finalPosition.x - 256, // Center the image
        y: finalPosition.y - 256, // Center the image
        rotation: 0,
        index: 'a1' as const,
        parentId: editorRef.current.getCurrentPageId(),
        isLocked: false,
        opacity: 1,
        meta: {},
        props: {
          assetId: assetId,
          w: 512,
          h: 512,
          playing: true,
          url: '',
          crop: null,
        },
      };

      // Create both asset and shape
      editorRef.current.createAssets([asset]);
      editorRef.current.createShapes([shape]);
      
      console.log('Image added to canvas successfully');
    } catch (error) {
      console.error('Failed to add image to canvas:', error);
      // Fallback: try a simpler approach
      try {
        const simpleShape = {
          id: `shape:image_${Date.now()}`,
          type: 'image',
          x: finalPosition.x - 256,
          y: finalPosition.y - 256,
          props: {
            url: `data:image/png;base64,${imageData}`,
            w: 512,
            h: 512,
          },
        };
        editorRef.current.createShapes([simpleShape]);
      } catch (fallbackError) {
        console.error('Fallback image creation also failed:', fallbackError);
      }
    }
  };

  // Method to add text to the canvas
  const addTextToCanvas = ({ text, position }: { text: string; position?: { x: number; y: number } }) => {
    if (!editorRef.current) {
      console.error('Editor not available');
      return;
    }

    let finalPosition = position;
    if (!finalPosition) {
      // Default to the center of the viewport if no position is provided
      const viewport = editorRef.current.getViewportScreenBounds();
      finalPosition = {
        x: viewport.x + viewport.w / 2,
        y: viewport.y + viewport.h / 2,
      };
    }

    console.log('Creating text shape with:', { text, position: finalPosition });

    // Use the proper tldraw v3 API to create a text shape
    try {
      // Create a minimal text shape with only required properties
      editorRef.current.createShapes([
        {
          id: `shape:text_${Date.now()}`,
          type: 'text',
          x: finalPosition.x,
          y: finalPosition.y,
          props: {
            richText: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: text,
                    },
                  ],
                },
              ],
            },
          }
        }
      ]);
    } catch (error) {
      console.error('Failed to create text shape:', error);
      // If the above fails, try using the editor's text tool directly
      try { 
        editorRef.current.setCurrentTool('text');
        editorRef.current.pointerDown(
          finalPosition.x, 
          finalPosition.y, 
          { target: 'canvas', type: 'click' }
        );
        // Note: This approach would require additional handling for text input
      } catch (fallbackError) {
        console.error('Fallback text creation also failed:', fallbackError);
      }
    }

    console.log('Text shape created successfully');
  };

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hello! I'm your Canvas Assistant. How can I help you with your creative projects today?"
    }
  ]);
  
  // Method to get canvas snapshot using proper tldraw API
  const getCanvasSnapshot = () => {
    if (!editorRef.current) return null;
    // Use the proper method to get all shapes
    return editorRef.current.getCurrentPageShapes();
  };
// Method to extract AI-friendly canvas context
  const extractCanvasContext = () => {
    const shapes = getCanvasSnapshot();
    if (!shapes || !Array.isArray(shapes)) return [];

    const aiContext = shapes
      .map((shape) => {
        let extractedText = '';

        if (shape.props.richText?.content?.[0]?.content?.[0]?.text) {
          extractedText = shape.props.richText.content[0].content[0].text;
        }

        return {
          id: shape.id,
          type: shape.type,
          text: extractedText,
          x: Math.round(shape.x || 0),
          y: Math.round(shape.y || 0),
          width: Math.round(shape.props?.w || 0),
          height: Math.round(shape.props?.h || 0),
        };
      })
      .filter((item) => item.text); // Only include items with extracted text

    return aiContext;
  };

  const createCanvasSummary = (aiContext) => {
    if (aiContext.length === 0) {
      return "The canvas is currently empty.";
    }

    const summary = aiContext
      .map((shape, i) => {
        let description = `Item ${i + 1}: A ${shape.type}`;

        if (shape.text) {
          description += ` that says \"${shape.text}\"`;
        }

        description += ` at position (${shape.x}, ${shape.y})`;

        return description;
      })
      .join('\n');

    const canvasContents = aiContext.length > 0 ? `Canvas contents (${aiContext.length} items):\n${summary}` : "The canvas is currently empty.";

    const actionsPrompt = `\n\nYou can also perform actions on the canvas. To add new text, respond with the following command format:\n\n\`\`\`\n[ACTION:ADD_TEXT]{"text": "your text here", "position": {"x": 123, "y": 456}}\n\`\`\`\n\n- The \`position\` is optional. If you don't provide it, the text will be placed in the center of the viewport.\n- You can add multiple text elements by including multiple action commands.\n- Always wrap the action command in code blocks as shown above.`;

    return `${canvasContents}${actionsPrompt}`;
  };
  
  // Method to get canvas context for AI
  const getCanvasContext = () => {
    // Extract AI-friendly canvas context using the clean structure
    const aiContext = extractCanvasContext();
    
    // Create human-readable summary for AI
    const canvasSummary = createCanvasSummary(aiContext);
    
    // Debug: Log the clean extracted data
    console.log('AI Context:', aiContext);
    console.log('Canvas Summary:', canvasSummary);
    
    return {
      aiContext,
      description: canvasSummary,
      shapeCount: aiContext.length,
      // Also provide structured JSON for potential future use
      structuredContext: aiContext
    };
  };
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
const [isModelOpen, setIsModelOpen] = useState(false);

const modelOptions = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "flux-schnell", label: "FLUX Schnell (Images)" },
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
    if (!userMessage && uploadedImages.length === 0) return;
    
    setMessages((prev) => [...prev, { 
      role: "user", 
      content: userMessage,
      images: uploadedImages
    }]);
    setInput("");
    setUploadedImages([]); // Clear uploaded images after sending
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
          conversationHistory: conversationHistory,
          images: uploadedImages // Send images to the backend
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage = data.message;
        
        // Add the AI's conversational message to the chat
        // We'll strip out any action commands so they don't show up in the chat
        const actionRegex = /\n? *`\[ACTION:ADD_TEXT\]({.*})`/s;
        const conversationalMessage = aiMessage.replace(actionRegex, '').trim();

        if (conversationalMessage) {
            setMessages((prev) => [...prev, { 
              role: "ai", 
              content: conversationalMessage
            }]);
        }

        // Check for image generation commands
        const imageGenMatches = aiMessage.match(/\[GENERATE_IMAGE:(.+?)\]/g);
        if (imageGenMatches) {
          for (const match of imageGenMatches) {
            const promptMatch = match.match(/\[GENERATE_IMAGE:(.+?)\]/);
            if (promptMatch && promptMatch[1]) {
              const imagePrompt = promptMatch[1].trim();
              console.log('Generating image with prompt:', imagePrompt);
              
              // Call image generation API
              try {
                const imageResponse = await fetch('/api/generate-image', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    prompt: imagePrompt,
                    numberOfImages: 1
                  })
                });
                
                const imageData = await imageResponse.json();
                console.log('Image API Response:', imageData);
                
                if (imageData.success && imageData.images && imageData.images.length > 0) {
                  const firstImage = imageData.images[0];
                  console.log('First image data:', firstImage);
                  
                  // Check if we have base64 data (server handles all conversions)
                  if (firstImage.imageData && firstImage.imageData !== 'undefined' && firstImage.imageData.length > 0) {
                    console.log('Adding image to canvas with base64 data length:', firstImage.imageData.length);
                    
                    // Add the generated image to the canvas
                    addImageToCanvas({ imageData: firstImage.imageData });
                    
                    // Add a success message
                    setMessages((prev) => [...prev, { 
                      role: "ai", 
                      content: `✨ Generated and added image: "${imagePrompt}" to the canvas!`
                    }]);
                  } else {
                    console.error('Image data is missing or invalid:', {
                      hasImageData: !!firstImage.imageData,
                      imageDataType: typeof firstImage.imageData,
                      imageDataLength: firstImage.imageData?.length,
                      fullImageObject: firstImage
                    });
                    setMessages((prev) => [...prev, { 
                      role: "ai", 
                      content: `❌ Generated image but data is invalid. Server may have failed to process the image.`
                    }]);
                  }
                } else {
                  console.error('Image generation failed:', imageData);
                  // Add error message
                  setMessages((prev) => [...prev, { 
                    role: "ai", 
                    content: `❌ Failed to generate image: ${imageData.message || 'Unknown error'}`
                  }]);
                }
              } catch (error) {
                console.error('Image generation error:', error);
                setMessages((prev) => [...prev, { 
                  role: "ai", 
                  content: `❌ Error generating image: ${error.message}`
                }]);
              }
            }
          }
        }

        // Check for and execute text actions - support multiple actions
        const actionMatches = aiMessage.matchAll(/```\s*\[ACTION:ADD_TEXT\]({.*?})\s*```/gs);
        let actionExecuted = false;
        
        for (const match of actionMatches) {
          if (match[1]) {
            try {
              const actionData = JSON.parse(match[1]);
              console.log('Executing AI Action:', actionData);
              if (actionData.text) {
                addTextToCanvas({ text: actionData.text, position: actionData.position });
                actionExecuted = true;
              }
            } catch (error) {
              console.error("Failed to parse or execute AI action:", error);
            }
          }
        }
        
        if (actionExecuted) {
          // Add a message indicating action was performed
          setMessages((prev) => [...prev, { 
            role: "ai", 
            content: "✨ Text added to canvas!"
          }]);
        }
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
        { icon: Image, label: "Generate image", action: "Generate an image of a futuristic cityscape" },
        { icon: Zap, label: "Templates", action: "Show me some canvas templates to get started" },
        { icon: Plus, label: "First steps", action: "What's the best way to begin a new project on this canvas?" }
      ];
    } else {
      // Canvas has content
      return [
        { icon: Sparkles, label: "Analyze canvas", action: "What do you think of my current canvas layout?" },
        { icon: Image, label: "Add image", action: "Generate an image that complements what's on my canvas" },
        { icon: Plus, label: "Next steps", action: "What should I add next to complete this project?" }
      ];
    }
  };
  
  const quickActions = getQuickActions();

  if (isCollapsed) {
    return (
      <div className={`fixed z-50 group ${
        isMobile 
          ? 'bottom-20 right-4'
          : 'bottom-8 right-8'
      }`}>
        {/* Floating Canvas Assistant Button */}
        <div className="relative">
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-slate-400 opacity-10 blur-lg scale-125 group-hover:opacity-20 transition-all duration-500" />
          
          {/* Main Button */}
          <Button
            onClick={() => onToggleCollapse(false)}
            className={`relative rounded-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 p-0 overflow-hidden group/button ${
              isMobile ? 'w-12 h-12' : 'w-14 h-14'
            }`}
          >
            {/* Subtle Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700" />
            
            {/* Canvas Icon */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <Palette className={`drop-shadow-sm ${
                isMobile ? 'w-5 h-5' : 'w-6 h-6'
              }`} />
            </div>
          </Button>
          
          {/* Minimal Online Indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
        </div>
        
        {/* Clean Tooltip - Hide on mobile */}
        {!isMobile && (
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            <div className="bg-slate-800/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-slate-600/20 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-medium">Canvas Assistant</span>
              </div>
              <div className="absolute top-full right-3 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-slate-800/95" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile full-screen modal
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 items-center justify-center shadow-md hidden">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:block hidden">
              Canvas Assistant
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleCollapse(true)}
            className="w-10 h-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </header>

        {/* Quick Actions - Mobile */}
        {messages.length <= 1 && (
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={() => {
                    setInput(action.action);
                    inputRef.current?.focus();
                  }}
                  className="h-auto p-3 justify-start text-left hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 rounded-xl group border border-slate-200/50 dark:border-slate-700/50"
                >
                  <action.icon className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs">{action.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Image upload preview - Mobile */}
        {uploadedImages.length > 0 && (
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="grid grid-cols-4 gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={`data:${image.mimeType};base64,${image.data}`} 
                    alt={`upload-preview-${index}`} 
                    className="rounded-lg object-cover w-full h-16" 
                  />
                  <button 
                    onClick={() => removeUploadedImage(index)} 
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area - Mobile */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 group",
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}>
              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md",
                m.role === 'user' 
                  ? 'bg-slate-600 dark:bg-slate-500' 
                  : 'bg-slate-700 dark:bg-slate-600'
              )}>
                {m.role === 'user' ? (
                  <User className="w-3 h-3 text-white" />
                ) : (
                  <Palette className="w-3 h-3 text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
                m.role === 'user' 
                  ? 'bg-slate-600 dark:bg-slate-500 text-white rounded-tr-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-md'
              )}>
                <div className="text-sm leading-relaxed">
                  {m.role === 'ai' ? (
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div>
                      {m.images && m.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {m.images.map((img, idx) => (
                            <img key={idx} src={`data:${img.mimeType};base64,${img.data}`} alt={`user-image-${idx}`} className="rounded-lg max-w-full h-auto" style={{ maxHeight: '120px' }} />
                          ))}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center shadow-md">
                <Palette className="w-3 h-3 text-white" />
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

        {/* Input Form - Mobile */}
        <form id="ai-chat-form" onSubmit={handleSend} className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="relative">
              <textarea
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-xl border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 text-sm placeholder:text-slate-400 resize-none min-h-[80px] max-h-[120px] overflow-y-auto"
                disabled={isTyping}
                rows={3}
              />
              
              {/* Send Button */}
              <Button
                type="submit"
                size="sm"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50"
                disabled={(!input.trim() && uploadedImages.length === 0) || isTyping}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="w-8 h-8 rounded-full" onClick={() => imageInputRef.current?.click()}>
                  <Upload className="w-4 h-4" />
                </Button>
                <input 
                  type="file"
                  ref={imageInputRef}
                  multiple 
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button type="button" variant="ghost" size="sm" className="w-8 h-8 rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Model selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelOpen(!isModelOpen)}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  {modelOptions.find((m) => m.value === selectedModel)?.label.split(' ')[0]}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isModelOpen && (
                  <div className="absolute bottom-full mb-2 right-0 w-40 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-lg shadow-lg z-20">
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
          </div>
        </form>
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
            <div className="md:block hidden">
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
                className="h-auto p-3 justify-start text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-xl group whitespace-normal"
              >
                <action.icon className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 break-words">{action.action}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Image upload preview */}
      {uploadedImages.length > 0 && (
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="grid grid-cols-3 gap-2">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={`data:${image.mimeType};base64,${image.data}`} 
                  alt={`upload-preview-${index}`} 
                  className="rounded-lg object-cover w-full h-24" 
                />
                <button 
                  onClick={() => removeUploadedImage(index)} 
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
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
              <div className="text-sm leading-relaxed">
                {m.role === 'ai' ? (
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="mb-2 last:mb-0 ml-4 list-disc">{children}</ul>,
                        ol: ({children}) => <ol className="mb-2 last:mb-0 ml-4 list-decimal">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        code: ({children}) => <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic">{children}</blockquote>,
                        h1: ({children}) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                        h2: ({children}) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div>
                    {m.images && m.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {m.images.map((img, idx) => (
                          <img key={idx} src={`data:${img.mimeType};base64,${img.data}`} alt={`user-image-${idx}`} className="rounded-lg max-w-full h-auto" style={{ maxHeight: '150px' }} />
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                )}
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

            {/* Image upload and generation buttons */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => imageInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
              </Button>
              <input 
                type="file"
                ref={imageInputRef}
                multiple 
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                <Camera className="w-4 h-4" />
              </Button>
            </div>

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
            disabled={(!input.trim() && uploadedImages.length === 0) || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </aside>
  );
}
