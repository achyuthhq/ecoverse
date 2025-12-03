"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button2";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Send, User, Bot, Leaf, X, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "# Welcome to Ecoverse AI Assistant! 👋\n\nI'm here to help with your environmental questions. Ask me anything.\n\nHow can I assist you today?"
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const apiKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY || '';
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
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

  return (
    <>
      {/* Chat button - moved to the left side */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-28 left-6 z-50 rounded-full p-3 shadow-lg ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
        } text-white transition-all duration-300`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </motion.button>

      {/* Chat window - reduced width and made responsive */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-4 z-40 w-[calc(100%-32px)] sm:w-[300px] max-w-[300px] h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
            ref={chatContainerRef}
          >
            <div className="flex flex-col h-full bg-white">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                  <div className="relative h-7 w-7 rounded-full overflow-hidden bg-white/20 flex items-center justify-center p-1">
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-base font-medium text-white flex items-center">
                    Ecoverse Assistant
                  </h2>
                </div>
                <Button
                  onClick={resetChat}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-7 w-7 p-0"
                  disabled={loading}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gradient-to-b from-slate-50 to-white">
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
                        className={`flex items-start gap-2 max-w-[90%] ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Icon for the message */}
                        {message.role === "user" ? (
                          <div className="flex-shrink-0 rounded-full p-1.5 bg-blue-100 text-blue-600 shadow-sm">
                            <User className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 rounded-full bg-green-100 p-1.5 shadow-sm text-green-600">
                            <Bot className="h-3 w-3" />
                          </div>
                        )}
                        
                        {/* Message content */}
                        <div
                          className={`p-3 rounded-2xl ${
                            message.role === "user"
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white border border-gray-100 shadow-md"
                          }`}
                        >
                          {message.role === "user" ? (
                            <p className="whitespace-pre-wrap text-xs">{message.content}</p>
                          ) : (
                            <div className="prose prose-xs max-w-none
prose-headings:font-bold
prose-h1:text-base prose-h1:mb-3 prose-h1:mt-1 prose-h1:text-green-700 prose-h1:pb-2 prose-h1:border-b prose-h1:border-gray-100
prose-h2:text-sm prose-h2:mb-2.5 prose-h2:mt-4 prose-h2:text-green-600 prose-h2:pb-1.5 prose-h2:border-b prose-h2:border-gray-100
prose-h3:text-xs prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-green-600 prose-h3:font-semibold
prose-p:my-2 prose-p:text-xs prose-p:leading-relaxed
prose-ul:my-2.5 prose-ul:space-y-1
prose-li:my-1 prose-li:text-xs prose-li:leading-relaxed
prose-hr:my-4 prose-hr:border-gray-100
prose-strong:text-green-700 prose-strong:font-bold
prose-blockquote:border-l-4 prose-blockquote:border-green-200 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-gray-600
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
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 rounded-full bg-green-100 p-1.5 shadow-sm text-green-600">
                        <Bot className="h-3 w-3" />
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white">
                <div className="flex space-x-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[40px] max-h-[120px] text-sm resize-none border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 w-10 p-0 flex-shrink-0"
                    disabled={loading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 