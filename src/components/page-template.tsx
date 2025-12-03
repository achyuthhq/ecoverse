"use client";

import DashboardShell from "@/components/dashboard-shell";

interface PageTemplateProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function PageTemplate({ children, title, description }: PageTemplateProps) {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-4 pt-6 sm:pt-8 md:pt-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="text-gray-300 max-w-md mx-auto text-xs sm:text-sm px-4 mt-2">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </DashboardShell>
  );
}
