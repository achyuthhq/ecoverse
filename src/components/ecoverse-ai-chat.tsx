"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, RefreshCw, Leaf, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button2";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import { PromptBox } from "@/components/ui/prompt-box";
import VoiceRecorder from "@/components/voice-recorder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function EcoverseAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const { toast } = useToast();

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "ai",
        content: `# Hello! 👋 I'm Ecoverse AI 🌱

I'm your personal environmental assistant! I can help you with:

🔍 **Environmental Questions** - Ask about sustainability, recycling, or environmental impact
♻️ **Recycling Tips** - Get specific guidance on how to properly recycle different materials
🌿 **Eco Alternatives** - Discover sustainable alternatives and better choices
💡 **DIY Ideas** - Learn creative ways to repurpose or upcycle items
📊 **Impact Data** - Understand environmental footprints and carbon impact
🌍 **Climate Facts** - Get information about climate change and environmental science

**How can I assist you today?** 🚀`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check if scroll button should be shown
  useEffect(() => {
    const checkScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format response for better readability
  const formatResponse = (text: string | any): string => {
    // Ensure we have a string
    let textStr: string;
    if (typeof text !== 'string') {
      try {
        textStr = JSON.stringify(text);
      } catch {
        textStr = String(text);
      }
    } else {
      textStr = text;
    }
    
    // Clean up the response
    let formattedText = textStr
      // Aggressively remove [object Object] patterns
      .replace(/\[object\s+Object\]/gi, '')
      .replace(/\[object\s+object\]/gi, '')
      .replace(/\[Object\]/g, '')
      .replace(/object Object/gi, '')
      .replace(/\s*•\s*\[object\s+Object\]\s*/gi, '')
      .replace(/\s*\[object\s+Object\]\s*•\s*/gi, '')
      .replace(/\s*\[object\s+Object\]\s*/gi, ' ')
      // Remove any markdown code blocks if present
      .replace(/```json\s*([\s\S]*?)\s*```/g, "$1")
      .replace(/```\s*([\s\S]*?)\s*```/g, "$1")
      
      // Convert bullet points that start with • to proper markdown lists
      .replace(/^([•])\s+(.+)$/gm, '- $2')
      
      // Split on " - " pattern when it appears to separate bullet points
      .replace(/([.!?:])\s*-\s+(?=[A-Z])/g, '$1\n- ')
      .replace(/\s+-\s+(?=[A-Z][a-z])/g, '\n- ')
      
      // Split bullet points that are on the same line
      .replace(/([^\n])\s*•\s+/g, '$1\n- ')
      .replace(/\s*•\s+/g, '\n- ')
      .replace(/^-\s+/gm, '- ')
      
      // Clean up lines that only contain [object Object] or whitespace
      .replace(/^\s*\[object\s+Object\]\s*$/gim, '')
      
      // Ensure proper spacing for headings
      .replace(/\n+(#{1,2} )/g, '\n\n$1')
      .replace(/^(#{1,2} .+)$/gm, '$1\n')
      
      // Process line by line to split any remaining multi-bullet lines
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('- ')) {
          return line.replace(/[ \t]+/g, ' ').trim();
        }
        
        if (line.includes(' - ')) {
          const matches = line.match(/\s+-\s+(?=[A-Z])/g);
          if (matches && matches.length > 0) {
            const parts = line.split(/\s+-\s+(?=[A-Z])/);
            if (parts.length > 1) {
              let result = parts[0].trim();
              const bulletParts = parts.slice(1)
                .map(p => {
                  const trimmed = p.trim();
                  return trimmed.startsWith('- ') ? trimmed : `- ${trimmed}`;
                })
                .join('\n');
              
              if (bulletParts.trim()) {
                result += '\n' + bulletParts;
              }
              return result;
            }
          }
        }
        
        return line.replace(/[ \t]+/g, ' ').trim();
      })
      .join('\n')
      
      // Ensure each list item is on its own line
      .replace(/\n(- .+)\n([^-#\n])/g, '\n$1\n\n$2')
      .replace(/(- .+)\s+(- .+)/g, '$1\n$2')
      .replace(/^(- .+?)\s+(?=- |#|$)/gm, '$1')
      
      // Clean up excessive blank lines
      .replace(/\n{4,}/g, '\n\n\n')
      .replace(/\n(- .+)\n(- .+)/g, '\n$1\n$2')
      .trim();
    
    return formattedText;
  };

  // Handle sending a message
  const handleSendMessage = async (messageText?: string, model?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    const modelToUse = model || selectedModel;
    
    try {
      // Create prompt for general environmental questions
      const prompt = `You are Ecoverse AI, an expert environmental assistant focused on sustainability, waste management, and environmental impact. 

Answer this user question: "${messageToSend}"

**Instructions:**
- Provide accurate, helpful information about environmental topics
- Be concise but comprehensive (150-300 words)
- Use clear formatting with **bold** for key points
- Use markdown bullet points (-) for lists, with EACH bullet point on a NEW LINE
- Format: "- First point\n- Second point\n- Third point"
- Focus on actionable advice and practical solutions
- Include relevant environmental facts when appropriate

**Response:**`;
      
      // Map model selection to actual API parameter
      const apiModel = modelToUse === 'openai-gpt5' ? 'openai' : modelToUse;
      
      const apiKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY || '';
      const encodedPrompt = encodeURIComponent(prompt);
      const params = new URLSearchParams();
      if (apiKey) params.append('key', apiKey);
      params.append('model', apiModel);
      const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }
      
      // Get the text response
      const responseText = await response.text();
      
      // Clean up the response
      let cleanResponse = responseText;
      if (responseText.includes("```")) {
        cleanResponse = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, "$1");
        cleanResponse = cleanResponse.replace(/```\s*([\s\S]*?)\s*```/g, "$1");
      }
      
      // Ensure response is a string
      if (typeof cleanResponse !== 'string') {
        try {
          cleanResponse = JSON.stringify(cleanResponse);
        } catch {
          cleanResponse = String(cleanResponse);
        }
      }
      
      // Remove [object Object] patterns
      cleanResponse = cleanResponse
        .replace(/\[object\s+Object\]/gi, '')
        .replace(/\[object\s+object\]/gi, '')
        .replace(/\[Object\]/g, '')
        .replace(/object Object/gi, '')
        .replace(/\s*•\s*\[object\s+Object\]\s*/gi, '')
        .replace(/\s*\[object\s+Object\]\s*•\s*/gi, '')
        .replace(/\s*\[object\s+Object\]\s*/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      
      // Format the response
      cleanResponse = formatResponse(cleanResponse);
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: cleanResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "ai",
        content: "I'm sorry, but I couldn't process your request at the moment. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the chat
  const resetChat = () => {
    setMessages([]);
    // Welcome message will be added automatically by useEffect
  };

  // Handle voice transcription
  const handleVoiceTranscription = (text: string) => {
    if (text.trim()) {
      setInput(text);
      setIsVoiceRecorderOpen(false);
      // Optionally auto-send the transcribed text
      // handleSendMessage(text);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] relative overflow-hidden glass-card rounded-xl shadow-lg border border-white/10">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 glass-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-md">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white font-montserrat">Ecoverse AI</h2>
            <p className="text-xs text-gray-400 font-montserrat">Your environmental assistant</p>
          </div>
        </div>
        <Button
          onClick={resetChat}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-7 px-2 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white font-montserrat"
        >
          <RefreshCw className="h-3 w-3" />
          New Chat
        </Button>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 glass-card pb-24"
      >
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-3 ${
                    message.role === "user" 
                      ? "flex-row-reverse max-w-[90%]" 
                      : "flex-row max-w-[85%] sm:max-w-[75%] md:max-w-[65%]"
                  }`}
                >
                  {/* Icon for the message */}
                  {message.role === "user" ? (
                    <div className="flex-shrink-0 rounded-full p-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-md">
                      <User className="h-3 w-3" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 rounded-full p-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-md">
                      <Bot className="h-3 w-3" />
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div
                    className={`p-2.5 rounded-xl ${
                      message.role === "user"
                        ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-md"
                        : "glass-card border border-white/10 shadow-md"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap text-xs font-montserrat text-white">{message.content}</p>
                    ) : (
                      <div className="max-w-full font-montserrat">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-4 mt-0 pb-3 border-b-2 border-white/30" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mb-3 mt-5 pb-2 border-b border-white/20" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-bold text-white mb-2 mt-4" {...props} />,
                            p: ({node, ...props}) => <p className="text-sm text-gray-300 my-3 leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-white font-bold text-sm" {...props} />,
                            ul: ({node, ...props}) => <ul className="my-3 space-y-2 pl-0 list-none" {...props} />,
                            ol: ({node, ...props}) => <ol className="my-3 space-y-2 pl-0 list-none" {...props} />,
                            li: ({node, children, ...props}) => {
                              const content = React.Children.toArray(children)
                                .map((child: any) => {
                                  if (typeof child === 'string') return child;
                                  if (child?.props?.children) {
                                    return React.Children.toArray(child.props.children).join('');
                                  }
                                  return String(child);
                                })
                                .join('');
                              
                              return (
                                <li className="text-sm text-gray-300 my-2 leading-relaxed flex items-start gap-2">
                                  <span className="text-white font-bold flex-shrink-0 leading-none mt-0.5">•</span>
                                  <span className="flex-1">{content}</span>
                                </li>
                              );
                            },
                            hr: ({node, ...props}) => <hr className="my-4 border-white/10" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-white/20 pl-3 italic text-gray-300 my-3 text-sm" {...props} />,
                            code: ({node, ...props}: any) => {
                              const isInline = !props.className || !props.className.includes('language-');
                              return isInline ? (
                                <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs" {...props} />
                              ) : (
                                <code className="block text-white bg-white/5 border border-white/10 rounded p-2 overflow-x-auto text-xs font-mono" {...props} />
                              );
                            },
                            a: ({node, ...props}) => <a className="text-white no-underline hover:underline text-sm" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 rounded-xl p-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-md">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="relative overflow-hidden p-3 rounded-xl glass-card border border-white/10 shadow-md">
                    <div className="relative z-10 flex items-center space-x-1.5">
                      <motion.div 
                        className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -2, 0]
                        }}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0 
                        }}
                      />
                      <motion.div 
                        className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -2, 0]
                        }}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0.2 
                        }}
                      />
                      <motion.div 
                        className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -2, 0]
                        }}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0.4 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area - Floating */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <PromptBox
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSend={handleSendMessage}
          onVoiceRecord={() => {
            setIsVoiceRecorderOpen(true);
          }}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>

      {/* Voice Recorder Dialog */}
      <Dialog open={isVoiceRecorderOpen} onOpenChange={setIsVoiceRecorderOpen}>
        <DialogContent className="glass-card border border-white/10 max-w-md">
          <DialogTitle className="text-lg font-semibold text-white mb-4 font-montserrat">
            Voice Recognition
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-300 mb-4 font-montserrat">
            Click the microphone button to start recording your question.
          </DialogDescription>
          <div className="flex justify-center mb-4">
            <VoiceRecorder 
              onTranscriptionComplete={handleVoiceTranscription}
            />
          </div>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white font-montserrat"
            >
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-20 right-4 glass-card shadow-lg rounded-full p-1.5 z-10 border border-white/20"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4 text-white" />
        </motion.button>
      )}
    </div>
  );
}

