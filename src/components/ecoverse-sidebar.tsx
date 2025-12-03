"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Trophy,
  Settings,
  MessageCircle,
  Heart,
  Gamepad2,
  MapPin,
  Info,
  LogOut,
  Menu,
  X,
  Camera,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar2";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSession, signOut } from "next-auth/react";

const sidebarVariants = {
  open: {
    width: "15rem",
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.2,
    },
  },
  closed: {
    width: "4rem",
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.2,
    },
  },
};

const textVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1,
    },
  },
  closed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1,
    },
  },
};

interface EcoverseSidebarProps {
  children?: React.ReactNode;
  onOpenUploadModal?: () => void;
}

export function EcoverseSidebar({ children, onOpenUploadModal }: EcoverseSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/gallery", label: "Gallery", icon: Heart },
    { href: "/dashboard/search", label: "Search", icon: Search },
  ];

  const secondaryNavItems = [
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard/know", label: "Know Your ATMOS", icon: MapPin },
    { href: "/dashboard/game", label: "Game", icon: Gamepad2 },
    { href: "/dashboard/aichat", label: "AI Chat", icon: MessageCircle },
    { href: "/dashboard/about", label: "About", icon: Info },
  ];

  const NavLink = ({ item, isCollapsed }: { item: typeof navItems[0]; isCollapsed: boolean }) => {
    const Icon = item.icon;
    // Special handling for dashboard - only active when exactly /dashboard, not /dashboard/*
    let isActive = false;
    if (item.href === "/dashboard") {
      isActive = pathname === "/dashboard";
    } else {
      isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
    }
    // On mobile when open, always show labels. On desktop, respect collapsed state
    const showLabel = isMobileOpen || !isCollapsed;
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex h-10 w-full flex-row items-center rounded-lg px-3 py-2 transition text-gray-300",
          "hover:bg-white/10 hover:text-white",
          isActive &&
            "bg-white/10 text-white font-medium border border-white/30"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <AnimatePresence>
          {showLabel && (
            <motion.span
              initial="closed"
              animate="open"
              exit="closed"
              variants={textVariants}
              className="ml-3 text-sm font-medium"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#0c0c0c' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => {
          const newState = !isMobileOpen;
          setIsMobileOpen(newState);
          // When opening mobile menu, ensure it's not collapsed
          if (newState) {
            setIsCollapsed(false);
          }
        }}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border shadow-lg text-white"
        style={{ backgroundColor: '#191919', borderColor: 'rgba(255, 255, 255, 0.1)' }}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => {
              setIsMobileOpen(false);
              setIsCollapsed(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed md:relative left-0 top-0 z-40 h-screen shrink-0 border-r",
          isMobileOpen ? "block w-80 max-w-[85vw]" : "hidden md:block"
        )}
        style={{ backgroundColor: '#191919', borderColor: 'rgba(255, 255, 255, 0.1)' }}
        initial={false}
        animate={
          isMobileOpen 
            ? { width: "20rem", maxWidth: "85vw" } 
            : isCollapsed 
            ? "closed" 
            : "open"
        }
        variants={sidebarVariants}
        onMouseEnter={() => !isMobileOpen && window.innerWidth >= 768 && setIsCollapsed(false)}
        onMouseLeave={() => !isMobileOpen && window.innerWidth >= 768 && setIsCollapsed(true)}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 w-full shrink-0 border-b p-3 items-center justify-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <AnimatePresence mode="wait">
              {(isMobileOpen || !isCollapsed) ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn("flex items-center gap-2 w-full", isMobileOpen && "pl-12")}
                >
                  <div className="p-1 rounded-lg">
                    <Image src="/images/ecoverse.png" alt="Ecoverse" width={32} height={32} className="object-contain" />
                  </div>
                  <span className="text-lg font-semibold text-white">
                    Ecoverse
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="p-1 rounded-lg">
                    <Image src="/images/ecoverse.png" alt="Ecoverse" width={32} height={32} className="object-contain" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Items */}
          <ScrollArea className="flex-1 p-2">
            <div className="flex w-full flex-col gap-1">
              {/* Scan Now Button - Modern & Prominent */}
              {onOpenUploadModal && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-2"
                >
                  <Button
                    onClick={onOpenUploadModal}
                    className={cn(
                      "w-full h-9 rounded-lg font-medium text-xs relative overflow-hidden",
                      "bg-white text-gray-900 hover:bg-gray-100",
                      "shadow-md hover:shadow-lg transition-all duration-300",
                      "flex items-center justify-center border-0",
                      isMobileOpen || !isCollapsed ? "gap-1.5 px-3" : "gap-0 px-0"
                    )}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 -translate-x-full hover:translate-x-full"></div>
                    
                    <Camera className="h-4 w-4 shrink-0 relative z-10" />
                    <AnimatePresence>
                      {(isMobileOpen || !isCollapsed) && (
                        <motion.span
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={textVariants}
                          className="relative z-10 font-semibold"
                        >
                          Scan Now
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              )}

              {/* Main Navigation */}
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed && !isMobileOpen} />
              ))}

              <Separator className="w-full my-2" />

              {/* Secondary Navigation */}
              {secondaryNavItems.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed && !isMobileOpen} />
              ))}
            </div>
          </ScrollArea>

          {/* Bottom Section - Settings & User */}
          <div className="flex flex-col p-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex h-10 w-full flex-row items-center rounded-lg px-3 py-2 transition text-gray-300",
                "hover:bg-white/10 hover:text-white",
                pathname?.includes("/dashboard/settings") &&
                  "bg-green-500/20 text-green-400 font-medium border border-green-500/30"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {(isMobileOpen || !isCollapsed) && (
                  <motion.span
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={textVariants}
                    className="ml-3 text-sm font-medium"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Profile Dropdown */}
            <div className="mt-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="w-full">
                  <div className="flex h-10 w-full flex-row items-center gap-2 rounded-lg px-3 py-2 transition text-gray-300 hover:bg-white/10 hover:text-white">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback className="bg-green-500 text-white">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                      {(isMobileOpen || !isCollapsed) && (
                        <motion.div
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={textVariants}
                          className="flex flex-col items-start flex-1 min-w-0 text-left"
                        >
                          <p className="text-sm font-medium truncate w-full text-left">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate w-full text-left">
                            {user?.email || ""}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={5} align="start" className="w-56">
                  <div className="flex flex-row items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback className="bg-green-500 text-white">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {user?.name || "User"}
                      </span>
                      <span className="line-clamp-1 text-xs text-muted-foreground truncate">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4" /> Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 dark:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0c0c0c' }}>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
