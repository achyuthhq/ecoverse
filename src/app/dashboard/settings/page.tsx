import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard-shell";
import ProfileSection from "@/components/settings/profile-section";
import UsageSection from "@/components/settings/usage-section";
import LogoutSection from "@/components/settings/logout-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch user data including analysis count
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      _count: {
        select: {
          analyses: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Get total analyses count
  const analysesCount = user._count.analyses;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10 rounded-xl opacity-50" />
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Content */}
        <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8 bg-white/50 p-1 rounded-lg">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-400 data-[state=active]:text-white rounded-md transition-all"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="usage"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-400 data-[state=active]:text-white rounded-md transition-all"
              >
                Usage
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-400 data-[state=active]:text-white rounded-md transition-all"
              >
                Account
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ProfileSection user={user} />
            </TabsContent>
            
            <TabsContent value="usage" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <UsageSection analysesCount={analysesCount} />
            </TabsContent>
            
            <TabsContent value="account" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <LogoutSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
} 