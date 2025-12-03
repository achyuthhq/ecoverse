"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, Leaf, ChevronDown, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button2";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import { PromptBox } from "@/components/ui/prompt-box";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AnalysisChatProps {
  analysisId: string;
  initialAnalysisData?: {
    label: string;
    materialType: string;
    category: string;
    degradability: string;
    reusePotenial: string;
    environmentalImpact: string[];
    harms: string[];
    disposal: string[];
    alternatives: string[];
    recommendations: {
      reduce?: string;
      reuse?: string;
      recycle?: string;
    };
  };
}

export default function AnalysisChat({ analysisId, initialAnalysisData }: AnalysisChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();

  // Fetch initial analysis on component mount
  useEffect(() => {
    if (initialAnalysisData) {
      fetchInitialAnalysis();
    } else {
      // If no initial data, fetch from API
      fetchAnalysisFromApi();
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

  // Fetch analysis data from API if not provided
  const fetchAnalysisFromApi = async () => {
    setIsInitialLoading(true);
    
    try {
      const response = await fetch(`/api/analyses/${analysisId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analysis data");
      }

      const data = await response.json();
      setAnalysisData(data);
      
      // Parse JSON strings to arrays/objects
      const environmentalImpact = typeof data.environmentalImpact === 'string' 
        ? JSON.parse(data.environmentalImpact || '[]') 
        : (Array.isArray(data.environmentalImpact) ? data.environmentalImpact : []);
      
      // Generate AI analysis immediately with the fetched data
      await fetchInitialAnalysisWithData({
        label: data.label || 'Unknown item',
        materialType: data.type || 'Unknown',
        category: data.category || 'Uncategorized',
        degradability: data.degradability || 'Unknown',
        reusePotenial: data.potentialForReuse || 'Unknown',
        environmentalImpact: environmentalImpact,
        harms: typeof data.harms === 'string' ? JSON.parse(data.harms || '[]') : (Array.isArray(data.harms) ? data.harms : []),
        disposal: typeof data.disposal === 'string' ? JSON.parse(data.disposal || '[]') : (Array.isArray(data.disposal) ? data.disposal : []),
        alternatives: typeof data.alternatives === 'string' ? JSON.parse(data.alternatives || '[]') : (Array.isArray(data.alternatives) ? data.alternatives : []),
        recommendations: typeof data.recommendations === 'string' ? JSON.parse(data.recommendations || '{}') : (data.recommendations || {})
      });
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "ai",
        content: `👋 **Hey there! I'm Ecoverse AI** 🌱

I'm your personal environmental assistant! I can help you with:

🔍 **Analysis Questions** - Ask about the environmental impact, materials, or disposal methods
♻️ **Recycling Tips** - Get specific guidance on how to properly recycle this item
🌿 **Eco Alternatives** - Discover sustainable alternatives and better choices
💡 **DIY Ideas** - Learn creative ways to repurpose or upcycle this item
📊 **Impact Data** - Understand the environmental footprint and carbon impact

Just ask me anything about this analysis, and I'll provide detailed, helpful information! 🚀`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      setIsInitialLoading(false);
    }
  };

  // Helper function to fetch initial analysis with data
  const fetchInitialAnalysisWithData = async (data: {
    label: string;
    materialType: string;
    category: string;
    degradability: string;
    reusePotenial: string;
    environmentalImpact: string[];
    harms: string[];
    disposal: string[];
    alternatives: string[];
    recommendations: any;
  }) => {
    setIsInitialLoading(true);
    setAnalysisData(data);
    
    try {
      // Create concise, precise prompt for the API
      const prompt = `Provide a concise environmental analysis for: ${data.label}

**Item Details:**
- Material: ${data.materialType}
- Category: ${data.category}
- Degradability: ${data.degradability}

**Response Format (be precise, straight to the point):**

# ${data.label} - Environmental Analysis

**Material:** [Brief material composition - 1 sentence]
**Category:** ${data.category}
**Biodegradability:** [Yes/No + time if known]

## Environmental Impact
• [3-4 specific impacts, one line each]

## Health Risks  
• [2-3 specific risks, one line each]

## Disposal Method
• [Step-by-step, concise instructions]

## Eco-Friendly Alternatives
• [3-4 specific alternatives, one line each]

## Action Plan
• [2-3 immediate actions, one line each]

**Keep it concise, precise, and actionable. No fluff. Maximum 200 words total.`;
      
      // Call Pollinations API
      // Map model selection to actual API parameter
      const apiModel = (selectedModel || 'openai') === 'openai-gpt5' ? 'openai' : (selectedModel || 'openai');
      
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
        throw new Error("Failed to get AI analysis");
      }
      
      // Get the text response
      const responseText = await response.text();
      
      // Clean up the response (remove markdown code blocks if present)
      let cleanResponse = responseText;
      if (responseText.includes("```")) {
        cleanResponse = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, "$1");
      }
      
      // Format the response for better readability
      cleanResponse = formatResponse(cleanResponse);
      
      // Add the AI message
      const aiMessage: Message = {
        id: `initial-analysis`,
        role: "ai",
        content: cleanResponse,
        timestamp: new Date(),
      };
      
      setMessages([aiMessage]);
    } catch (error) {
      console.error("Error getting initial AI analysis:", error);
      
      // Fallback to a basic message if API fails
      const fallbackMessage: Message = {
        id: `initial-analysis-fallback`,
        role: "ai",
        content: `# Analysis Results for ${data.label}\n\n` +
                 `I've analyzed this item and here's what I found. Please ask me any questions about its environmental impact or disposal options.`,
        timestamp: new Date(),
      };
      
      setMessages([fallbackMessage]);
      
      toast({
        title: "Analysis generation issue",
        description: "There was a problem generating the detailed analysis. Basic information is shown instead.",
        variant: "destructive",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Fetch initial analysis from API
  const fetchInitialAnalysis = async () => {
    if (!initialAnalysisData) return;
    
    await fetchInitialAnalysisWithData(initialAnalysisData);
  };

  // Format response for better readability - simplified for markdown rendering
  const formatResponse = (text: string): string => {
    // Clean up the response
    let formattedText = text
      // Remove any markdown code blocks if present
      .replace(/```json\s*([\s\S]*?)\s*```/g, "$1")
      .replace(/```\s*([\s\S]*?)\s*```/g, "$1")
      
      // Convert bullet points that start with • or - to proper markdown lists
      .replace(/^([•-])\s+(.+)$/gm, '- $2')
      
      // Ensure proper spacing for headings
      .replace(/\n+(#{1,2} )/g, '\n\n$1')
      .replace(/^(#{1,2} .+)$/gm, '$1\n')
      
      // Ensure proper spacing for lists
      .replace(/\n(- .+)\n([^-])/g, '\n$1\n\n$2')
      
      // Clean up excessive blank lines
      .replace(/\n{4,}/g, '\n\n\n')
      
      // Clean up trailing whitespace
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
      // Get current analysis data (either from props or fetched data)
      const currentAnalysisData = analysisData || initialAnalysisData;
      
      // Helper to format arrays/strings
      const formatField = (field: any): string => {
        if (!field) return 'Not specified';
        if (Array.isArray(field)) return field.join(', ');
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) return parsed.join(', ');
            return String(parsed);
          } catch {
            return field;
          }
        }
        if (typeof field === 'object') return JSON.stringify(field);
        return String(field);
      };
      
      // Create detailed context about the specific analysis
      const analysisContext = currentAnalysisData ? `
**ANALYSIS CONTEXT:**
- Item: ${currentAnalysisData.label || 'Unknown item'}
- Material Type: ${currentAnalysisData.materialType || currentAnalysisData.type || 'Unknown'}
- Category: ${currentAnalysisData.category || 'Uncategorized'}
- Environmental Impact: ${formatField(currentAnalysisData.environmentalImpact)}
- Disposal Method: ${formatField(currentAnalysisData.disposal)}
- Alternatives: ${formatField(currentAnalysisData.alternatives)}
- Recommendations: ${formatField(currentAnalysisData.recommendations)}
- Harms: ${formatField(currentAnalysisData.harms)}
- Potential for Reuse: ${currentAnalysisData.reusePotenial || currentAnalysisData.potentialForReuse || 'Not specified'}
- Degradability: ${currentAnalysisData.degradability || 'Not specified'}
` : '';

      // Use Pollinations API for AI response with specific analysis context
      const prompt = `Answer this question about the analyzed item. Be precise and concise.

${analysisContext}

**Question:** "${messageToSend}"

**Instructions:**
- Answer directly based on the analysis data above
- Be specific to this exact item
- Keep response under 150 words
- Use clear formatting with **bold** for key points
- Use bullet points (•) for lists
- Be actionable and practical

**Response:**`;
      
      // Map model selection to actual API parameter
      // GPT-5 uses 'openai' parameter but different display name
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
      
      // Clean up the response (remove markdown code blocks if present)
      let cleanResponse = responseText;
      if (responseText.includes("```")) {
        cleanResponse = responseText.replace(/```json\s*([\s\S]*?)\s*```/g, "$1");
      }
      
      // Format the response for better readability
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
    if (initialAnalysisData) {
    fetchInitialAnalysis();
    } else {
      fetchAnalysisFromApi();
    }
  };

  // Function to truncate text to a specific number of words
  const truncateWords = (text: string | null | undefined, wordCount: number): string => {
    if (!text) return "";
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Handle voice transcription
  const handleVoiceTranscription = (text: string) => {
    if (text.trim()) {
      setInput(text);
    }
  };

  return (
    <div className="flex flex-col h-[600px] relative overflow-hidden glass-card rounded-xl shadow-lg border border-white/10">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 glass-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-md">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white font-montserrat">Ecoverse AI</h2>
            <p className="text-xs text-gray-400 font-montserrat">Analysis for the scanned / uploaded image.</p>
          </div>
        </div>
        <Button
          onClick={resetChat}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-7 px-2 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white font-montserrat"
        >
          <RefreshCw className="h-3 w-3" />
          New Analysis
        </Button>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 glass-card pb-24"
      >
        <div className="space-y-6">
          <AnimatePresence>
            {isInitialLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center items-center h-60"
              >
                <div                 className="relative overflow-hidden text-center glass-card p-6 rounded-2xl shadow-lg border border-white/10">
                  {/* Decorative elements */}
                  <div className="absolute top-3 right-3 opacity-20">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute bottom-3 left-3 opacity-20">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className="mx-auto bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-xl shadow-lg w-12 h-12 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                          <Loader2 className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white font-montserrat">
                    Analyzing {truncateWords(initialAnalysisData?.label, 8)}
                  </h3>
                      <p className="text-xs text-gray-300 font-montserrat">Generating comprehensive environmental assessment...</p>
                      
                      {/* Progress dots */}
                      <div className="flex justify-center items-center gap-1.5 mt-3">
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              messages.map((message) => (
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
                    className={`flex items-start gap-3 max-w-[90%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
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
                        <div className="max-w-none font-montserrat">
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
                                const content = Array.isArray(children) ? children.join('') : String(children || '');
                                // Handle bullet points that start with • or -
                                const isBullet = content.trim().startsWith('•') || content.trim().startsWith('-');
                                const cleanContent = isBullet ? content.trim().substring(1).trim() : content;
                                
                                return (
                                  <li className="text-sm text-gray-300 my-2 leading-relaxed flex items-center gap-2">
                                    <span className="text-white font-bold flex-shrink-0 leading-none">•</span>
                                    <span className="flex-1">{cleanContent}</span>
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
              ))
            )}
            
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
                    {/* Content */}
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
            // Voice recorder functionality can be integrated here
          }}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>
      
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