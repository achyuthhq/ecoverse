"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Send, User, Bot, Leaf, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import VoiceRecorder from "@/components/voice-recorder";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Add welcome message when page loads
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `# Hello! 👋 I'm your Ecoverse AI Assistant

I can help you with questions about:

• Sustainable living tips  
• Recycling information  
• Environmental impact of materials  
• Eco-friendly alternatives  
• Climate change facts

**How can I assist you today?**`
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages change
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Set loading state
    setLoading(true);

    try {
      // Create a prompt for the Pollinations API
      const prompt = `You are an environmental expert assistant for Ecoverse, a platform focused on sustainability and proper waste management. 
      Answer this user question concisely and helpfully: "${userMessage}"
      
      Format your response using Markdown with proper spacing between paragraphs and sections.
      Include relevant environmental facts when appropriate.`;
      
      // Use the Pollinations API directly
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseText = await response.text();
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: formatResponse(responseText) },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, I couldn't process your request at the moment. Please try again later." 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text: string): string => {
    // Improve spacing for better readability
    let formattedText = text
      // Ensure exactly TWO blank lines before each section heading
      .replace(/\n+(#{1,3} )/g, '\n\n\n$1')
      
      // Add TWO blank lines after headings
      .replace(/^(#+ .+)$/gm, '$1\n\n')
      
      // Add space after bullet points
      .replace(/^([•-] .+)$/gm, '$1\n\n')
      
      // Ensure proper spacing around horizontal rules
      .replace(/\n---\n/g, '\n\n\n---\n\n\n')
      
      // Remove any excessive blank lines (more than 4)
      .replace(/\n{5,}/g, '\n\n\n\n');
    
    return formattedText;
  };

  const resetChat = () => {
    setMessages([]);
  };

  const handleVoiceTranscription = (text: string) => {
    if (text.trim()) {
      setInput(text);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header - Modern Design */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
            <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            AI Assistant
          </h1>
        </div>
        <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
          Get instant answers about sustainability, recycling, and environmental topics
        </p>
      </div>

      {/* Chat Interface */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">EcoverseAI</h2>
              <p className="text-xs text-gray-500">Your environmental assistant</p>
            </div>
          </div>
          <Button 
            onClick={resetChat}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-50 border-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Messages Container */}
        <div 
          className="h-[calc(100vh-380px)] overflow-y-auto p-4 bg-gradient-to-b from-slate-50 via-white to-green-50/30"
          ref={chatContainerRef}
        >
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
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
prose-h1:text-lg sm:prose-h1:text-xl prose-h1:mb-3 sm:prose-h1:mb-4 prose-h1:mt-1 prose-h1:text-green-700 prose-h1:pb-2 prose-h1:border-b prose-h1:border-gray-100
prose-h2:text-base sm:prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-4 sm:prose-h2:mt-5 prose-h2:text-green-600 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
prose-h3:text-sm sm:prose-h3:text-base prose-h3:mb-2 sm:prose-h3:mb-3 prose-h3:mt-3 sm:prose-h3:mt-4 prose-h3:text-green-600 prose-h3:font-semibold
prose-p:my-2 sm:prose-p:my-3 prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed
prose-ul:my-3 sm:prose-ul:my-4 prose-ul:space-y-1.5 sm:prose-ul:space-y-2
prose-li:my-1 sm:prose-li:my-1.5 prose-li:text-xs sm:prose-li:text-sm prose-li:leading-relaxed
prose-hr:my-4 sm:prose-hr:my-5 prose-hr:border-gray-100
prose-strong:text-green-700 prose-strong:font-bold
prose-blockquote:border-l-4 prose-blockquote:border-green-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
prose-code:text-green-600 prose-code:bg-green-50 prose-code:px-1 prose-code:rounded
prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                        >
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-gray-100 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 flex gap-2 items-end">
              <VoiceRecorder onTranscriptionComplete={handleVoiceTranscription} />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about sustainability..."
                className="min-h-[50px] max-h-[120px] text-sm resize-none border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-xl shadow-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl h-[50px] w-[50px] p-0 flex-shrink-0 shadow-md"
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-40 right-6 bg-white shadow-lg rounded-full p-2 z-10 border border-gray-100"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </motion.button>
      )}
    </div>
  );
} 