"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, Leaf, ChevronDown, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import VoiceRecorder from "@/components/voice-recorder";

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
      
      // Create a welcome message with specific analysis context
      const welcomeMessage: Message = {
        id: `welcome-message`,
        role: "ai",
        content: `👋 **Hey there! I'm Ecoverse AI** 🌱

I've just analyzed your **${data.label || 'item'}** and I'm here to help you with any questions about it!

**What I found:**
• **Material Type:** ${data.type || 'Unknown'}
• **Category:** ${data.category || 'Uncategorized'}
• **Environmental Impact:** ${data.environmentalImpact || 'Analysis in progress'}

**I can help you with:**
🔍 **Specific questions** about this item's disposal, recycling, or environmental impact
♻️ **Recycling guidance** tailored to your specific item
🌿 **Eco-friendly alternatives** for this type of item
💡 **DIY upcycling ideas** for your specific item
📊 **Detailed impact analysis** and recommendations

Just ask me anything about your **${data.label || 'item'}**! 🚀`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
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
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Fetch initial analysis from API
  const fetchInitialAnalysis = async () => {
    if (!initialAnalysisData) return;
    
    setIsInitialLoading(true);
    setAnalysisData(initialAnalysisData);
    
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

  // Format response for better readability
  const formatResponse = (text: string): string => {
    // Improve spacing for better readability
    let formattedText = text
      // Remove any markdown code blocks if present
      .replace(/```json\s*([\s\S]*?)\s*```/g, "$1")
      .replace(/```\s*([\s\S]*?)\s*```/g, "$1")
      
      // Ensure exactly THREE blank lines before each main heading
      .replace(/\n+(#{1,2} )/g, '\n\n\n$1')
      
      // Add THREE blank lines after main headings
      .replace(/^(#{1,2} .+)$/gm, '$1\n\n\n')
      
      // Add TWO blank lines after subheadings
      .replace(/^(#{3,} .+)$/gm, '$1\n\n')
      
      // Ensure proper spacing for bullet points and lists
      .replace(/^([•-] .+)$/gm, '$1\n\n')
      
      // Add spacing between consecutive bullet points
      .replace(/([•-] .+)\n([•-] )/g, '$1\n\n$2')
      
      // Ensure proper spacing around horizontal rules
      .replace(/\n---+\n/g, '\n\n\n---\n\n\n')
      
      // Add spacing after paragraphs that don't end with double newlines
      .replace(/([^\n])\n([^#\n-•])/g, '$1\n\n$2')
      
      // Ensure proper spacing between sections
      .replace(/\n{2,}(#{1,3} )/g, '\n\n\n$1')
      
      // Add extra spacing before important sections
      .replace(/\n(## (?:Environmental Impact|Health Risks|Reuse Potential|Eco-Friendly Alternatives|Disposal Method|Degradation Tips|Awareness Tip|Recycling Centers|Carbon Footprint Score|Action Plan|Spread Awareness))/g, '\n\n\n$1')
      
      // Ensure proper spacing after section titles
      .replace(/(## .+)\n([^#\n])/g, '$1\n\n$2')
      
      // Add spacing after bold text (markdown **)
      .replace(/(\*\*[^*]+\*\*)\n([^#\n-•])/g, '$1\n\n$2')
      
      // Ensure proper spacing for numbered lists
      .replace(/^(\d+\. .+)$/gm, '$1\n\n')
      
      // Add spacing between numbered list items
      .replace(/(\d+\. .+)\n(\d+\. )/g, '$1\n\n$2')
      
      // Ensure proper spacing for blockquotes
      .replace(/^(.+)$/gm, (match) => {
        if (match.startsWith('> ')) {
          return match + '\n\n';
        }
        return match;
      })
      
      // Add spacing after colons in key-value pairs
      .replace(/(\*\*[^*]+:\*\*)\s*/g, '$1\n\n')
      
      // Ensure proper spacing for material and category information
      .replace(/(\*\*Material:\*\*|\*\*Category:\*\*|\*\*Biodegradability:\*\*|\*\*Toxicity Level:\*\*)/g, '\n\n$1')
      
      // Remove any excessive blank lines (more than 4)
      .replace(/\n{5,}/g, '\n\n\n\n')
      
      // Ensure the document starts with proper spacing
      .replace(/^([^#\n])/, '\n\n$1')
      
      // Clean up any trailing whitespace
      .trim();
    
    return formattedText;
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
      // Get current analysis data (either from props or fetched data)
      const currentAnalysisData = analysisData || initialAnalysisData;
      
      // Create detailed context about the specific analysis
      const analysisContext = currentAnalysisData ? `
**ANALYSIS CONTEXT:**
- Item: ${currentAnalysisData.label || 'Unknown item'}
- Material Type: ${currentAnalysisData.type || 'Unknown'}
- Category: ${currentAnalysisData.category || 'Uncategorized'}
- Environmental Impact: ${currentAnalysisData.environmentalImpact || 'Not specified'}
- Disposal Method: ${currentAnalysisData.disposal || 'Not specified'}
- Alternatives: ${currentAnalysisData.alternatives || 'Not specified'}
- Recommendations: ${currentAnalysisData.recommendations || 'Not specified'}
- Harms: ${currentAnalysisData.harms || 'Not specified'}
- Potential for Reuse: ${currentAnalysisData.potentialForReuse || 'Not specified'}
- Degradability: ${currentAnalysisData.degradability || 'Not specified'}
` : '';

      // Use Pollinations API for AI response with specific analysis context
      const prompt = `You are EcoAnalyst, an AI expert in environmental analysis. You have just analyzed a specific item and the user is asking questions about it.

${analysisContext}

**USER QUESTION:** "${input}"

**INSTRUCTIONS:**
- Answer based on the SPECIFIC analysis data provided above
- Be contextual and relevant to this exact item
- Provide specific, actionable advice for this particular item
- If the user asks about disposal, give specific steps for this item type
- If asking about environmental impact, reference the actual analysis findings
- Be concise, helpful, and educational
- Use bullet points and clear formatting
- Include practical next steps when relevant

Respond with helpful, accurate, and detailed information tailored to this specific item.`;
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?token=jpeqKMnAtaTE0GCO`);

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
    <div className="flex flex-col h-[600px] relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">Ecoverse AI</h2>
            <p className="text-xs text-gray-500">Analysis for the scanned / uploaded image.</p>
          </div>
        </div>
        <Button
          onClick={resetChat}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-50 border-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 via-white to-green-50/30"
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
                <div className="relative overflow-hidden text-center bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 rounded-3xl"></div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <Sparkles className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-20">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-6">
                      <div className="mx-auto bg-gradient-to-br from-green-400 via-emerald-500 to-blue-500 p-4 rounded-2xl shadow-lg w-16 h-16 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                          <Loader2 className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
                    Analyzing {truncateWords(initialAnalysisData?.label, 8)}
                  </h3>
                      <p className="text-sm text-gray-600 font-medium">Generating comprehensive environmental assessment...</p>
                      
                      {/* Progress dots */}
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-emerald-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
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
                      <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    )}
                    
                    {/* Message content */}
                    <div
                      className={`p-3 sm:p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                          : "bg-white border border-gray-100 shadow-md"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</p>
                      ) : (
                        <div className="prose prose-xs sm:prose-sm max-w-none 
                        prose-headings:font-bold 
                          prose-h1:text-lg sm:prose-h1:text-xl prose-h1:mb-4 sm:prose-h1:mb-6 prose-h1:mt-6 sm:prose-h1:mt-8 prose-h1:text-green-700 prose-h1:pb-3 prose-h1:border-b-2 prose-h1:border-green-200 prose-h1:font-extrabold
                          prose-h2:text-base sm:prose-h2:text-lg prose-h2:mb-4 prose-h2:mt-8 sm:prose-h2:mt-10 prose-h2:text-green-600 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200 prose-h2:font-bold
                          prose-h3:text-sm sm:prose-h3:text-base prose-h3:mb-3 sm:prose-h3:mb-4 prose-h3:mt-6 sm:prose-h3:mt-8 prose-h3:text-green-600 prose-h3:font-semibold
                          prose-p:my-4 sm:prose-p:my-5 prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-p:text-gray-700
                          prose-ul:my-5 sm:prose-ul:my-6 prose-ul:space-y-3 sm:prose-ul:space-y-4
                          prose-li:my-2 sm:prose-li:my-3 prose-li:text-sm sm:prose-li:text-base prose-li:leading-relaxed prose-li:text-gray-700
                          prose-hr:my-8 sm:prose-hr:my-10 prose-hr:border-gray-200
                          prose-strong:text-green-700 prose-strong:font-bold prose-strong:text-base
                          prose-blockquote:border-l-4 prose-blockquote:border-green-300 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-6
                          prose-code:text-green-600 prose-code:bg-green-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-medium
                          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                          prose-ol:my-5 sm:prose-ol:my-6 prose-ol:space-y-3 sm:prose-ol:space-y-4
                          prose-li:marker:text-green-500"
                        >
                          <ReactMarkdown>
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
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-2xl p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="relative overflow-hidden p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg">
                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-blue-50/30 rounded-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex items-center space-x-2">
                      <motion.div 
                        className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -3, 0]
                        }}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0 
                        }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-sm"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -3, 0]
                        }}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0.2 
                        }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.6, 1, 0.6],
                          y: [0, -3, 0]
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
      
      {/* Input area */}
      <div className="mt-auto py-3 px-4 border-t border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2 items-end">
            <VoiceRecorder onTranscriptionComplete={handleVoiceTranscription} />
            <Textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about the environmental impact..."
              className="min-h-[50px] text-sm resize-none border-gray-200 focus-visible:ring-green-500 focus-visible:ring-1 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()} 
            className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl h-[50px] w-[50px] p-0 flex-shrink-0 shadow-md"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-24 right-6 bg-white shadow-lg rounded-full p-2 z-10 border border-gray-100"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </motion.button>
      )}
    </div>
  );
} 