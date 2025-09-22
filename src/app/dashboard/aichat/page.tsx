import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import AIChatContent from "@/components/ai-chat-content";

export default async function AIChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell>
      <AIChatContent />
    </DashboardShell>
  );
} 