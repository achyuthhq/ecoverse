"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AnalysisChatProps {
  analysisId: string;
  initialAnalysisData: {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch initial analysis on component mount
  useEffect(() => {
    fetchInitialAnalysis();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial analysis from API
  const fetchInitialAnalysis = async () => {
    setIsInitialLoading(true);
    
    try {
      // Create detailed prompt for the API
      const prompt = `You are EcoAnalyst, an AI expert in environmental analysis. 
      
      Please provide a detailed environmental analysis for the item: ${initialAnalysisData.label}.
      
      Here's what we know about the item:
      - Material: ${initialAnalysisData.materialType}
      - Category: ${initialAnalysisData.category}
      - Degradability: ${initialAnalysisData.degradability}
      - Reuse Potential: ${initialAnalysisData.reusePotenial}
      
      Format your response as a comprehensive environmental assessment with the following 16 sections:
      
      # Analysis Results for ${initialAnalysisData.label}
      
      **Detected Item:** ${initialAnalysisData.label}
      **Material:** [Provide detailed information about the material composition]
      **Category:** [Specify waste type - Organic, Recyclable, Hazardous, E-Waste, etc.]
      **Biodegradability:** [Yes/No + specific time to degrade, e.g., 450 years]
      **Toxicity Level:** [Safe / Harmful / Highly Hazardous]
      
      ## Environmental Impact
      • [List at least 3-5 detailed environmental impacts like pollution, marine damage, etc.]
      
      ## Health Risks
      • [List specific harms to humans/animals, e.g., chemical leakage]
      
      ## Reuse Potential
      • [High / Moderate / Low + specific examples of how to reuse]
      
      ## Eco-Friendly Alternatives
      • [Suggest at least 3-5 specific eco-friendly alternatives like reusable steel, bamboo, etc.]
      
      ## Disposal Method
      • [Provide step-by-step guide for proper disposal - drop-off, compost, hazardous bin, etc.]
      
      ## Degradation Tips
      • [How to accelerate decomposition, e.g., shred organic waste]
      
      ## Awareness Tip
      • [Fun fact or mythbuster to educate the user]
      
      ## Recycling Centers
      • [General suggestions for finding recycling centers]
      
      ## Carbon Footprint Score
      • [Rate from 1-5 (low to high impact) with explanation]
      
      ## Action Plan
      • [Specific actions the user can take immediately]
      
      ## Spread Awareness
      • [One-liner to share/post on social media]
      
      Be specific, detailed, and educational in your response. If the item is electronic, mention e-waste concerns. If it's plastic, discuss microplastics. Tailor your response to the specific item.`;
      
      // Call Pollinations API
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      
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
        content: `# Analysis Results for ${initialAnalysisData.label}\n\n` +
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Use Pollinations API for AI response
      const prompt = `You are EcoAnalyst, an AI expert in environmental analysis helping a user understand the environmental impact of ${initialAnalysisData.label}. 
      The user asks: "${input}"
      
      Respond with helpful, accurate, and detailed information about this item's environmental impact, disposal methods, or eco-friendly alternatives. Be specific and educational in your response.`;
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      
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
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: cleanResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Failed to get response",
        description: "There was a problem getting a response from the AI.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[800px] relative overflow-hidden">
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/10 to-blue-100/10 backdrop-blur-[2px] pointer-events-none" />
      
      {/* Chat header */}
      <div className="relative bg-gradient-to-r from-green-500/90 to-blue-500/90 p-5 text-white backdrop-blur-md border-b border-white/20 shadow-lg z-10">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <Bot className="h-6 w-6" />
            <span>Eco Analysis Chat</span>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="ml-2"
            >
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </motion.div>
          </h2>
          <p className="text-sm opacity-90">
            Ask questions about {initialAnalysisData.label} and its environmental impact
          </p>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-sm">
        {isInitialLoading ? (
          <div className="flex justify-center items-center h-full">
            <motion.div 
              className="text-center bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Analyzing {initialAnalysisData.label}</h3>
              <p className="text-gray-600">Generating comprehensive environmental assessment...</p>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 mb-6 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] rounded-2xl p-5 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                      : "bg-white/80 backdrop-blur-sm border border-gray-100"
                  }`}
                >
                  <div className="flex-shrink-0 mr-4">
                    {message.role === "user" ? (
                      <div className="bg-green-400 rounded-full p-2">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-blue-400 to-green-400 rounded-full p-2">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`${message.role === "user" ? "text-white" : "text-gray-800"}`}>
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      ) : (
                        <div className="markdown-content prose prose-sm max-w-none text-sm">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-6 justify-start"
              >
                <div className="flex max-w-[80%] rounded-2xl p-5 bg-white/80 backdrop-blur-sm border border-gray-100 shadow-md">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-gradient-to-br from-blue-400 to-green-400 rounded-full p-2">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-5 w-5 text-green-500 mr-3" />
                      </motion.div>
                    </div>
                    <span className="text-sm text-gray-600">Analyzing your question...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </AnimatePresence>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-5 border-t border-gray-100 bg-white/80 backdrop-blur-md relative z-10">
        <div className="flex gap-3 max-w-5xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 resize-none rounded-xl border-gray-200 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 shadow-sm"
            rows={2}
            disabled={isInitialLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || isInitialLoading || !input.trim()}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white self-end h-12 rounded-xl px-6 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
} 