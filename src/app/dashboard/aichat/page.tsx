"use client";

import PageTemplate from "@/components/page-template";
import { MessageCircle, Bot, Sparkles } from "lucide-react";

export default function AIChatPage() {
  return (
    <PageTemplate 
      title="AI Chat" 
      description="Chat with our AI assistant about environmental topics"
    >
      <div className="glass-card rounded-2xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
          </div>
          <p className="text-gray-300 mb-8">
            Ask our AI assistant anything about environmental topics, recycling, or sustainability.
          </p>
          <div className="glass-card rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-white">Chat coming soon!</span>
            </div>
            <p className="text-sm text-gray-300">
              Our AI chat feature will be available soon. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}