"use client";

import React, { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClassicLoader from "@/components/ui/classic-loader";
import { EcoverseSidebar } from "@/components/ecoverse-sidebar";
import UploadModal from "@/components/upload-modal";

interface DashboardShellProps {
  children: React.ReactNode;
}

interface UploadModalContextValue {
  openUploadModal: () => void;
}

const UploadModalContext = createContext<UploadModalContextValue | undefined>(undefined);

export const useUploadModal = () => {
  const context = useContext(UploadModalContext);
  if (!context) {
    throw new Error("useUploadModal must be used within DashboardShell");
  }
  return context;
};

const DashboardShell = ({ children }: DashboardShellProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // User session is now handled by NextAuth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/login");
    return null;
  }

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <UploadModalContext.Provider value={{ openUploadModal: handleOpenModal }}>
      <EcoverseSidebar onOpenUploadModal={handleOpenModal}>
      {children}
      {/* Upload Modal */}
      <UploadModal isOpen={isUploadModalOpen} onClose={handleCloseModal} />
    </EcoverseSidebar>
    </UploadModalContext.Provider>
  );
};

export default DashboardShell;
