"use client";

import PageTemplate from "@/components/page-template";
import EcoverseAIChat from "@/components/ecoverse-ai-chat";

export default function AIChatPage() {
  return (
    <PageTemplate 
      title="Ecoverse AI" 
      description="Chat with Ecoverse AI about environmental topics, sustainability, and waste management"
    >
      <EcoverseAIChat />
    </PageTemplate>
  );
}