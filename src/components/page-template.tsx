"use client";

import { useCodeAuth } from "@/lib/auth-utils";
import DashboardShell from "@/components/dashboard-shell";
import ClassicLoader from "@/components/ui/classic-loader";

interface PageTemplateProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function PageTemplate({ children, title, description }: PageTemplateProps) {
  const { user, isLoading } = useCodeAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4 mt-2">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </DashboardShell>
  );
}
