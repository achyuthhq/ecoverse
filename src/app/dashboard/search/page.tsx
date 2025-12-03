"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Clock, ArrowRight, Filter, Sparkles, Zap, Target, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardShell from "@/components/dashboard-shell";
import { Input } from "@/components/ui/input2";
import { Button } from "@/components/ui/button2";
import { useSession } from "next-auth/react";
import ClassicLoader from "@/components/ui/classic-loader";

interface Analysis {
  id: string;
  label: string;
  type: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export default function SearchPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Fetch analyses on component mount
  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  // Filter analyses based on search query and filter
  useEffect(() => {
    let filtered = analyses;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(analysis => 
        analysis.label?.toLowerCase().includes(query) ||
        analysis.type?.toLowerCase().includes(query) ||
        analysis.category?.toLowerCase().includes(query)
      );
  }

    // Apply category filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(analysis => 
        analysis.category?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }
    
    setFilteredAnalyses(filtered);
  }, [searchQuery, selectedFilter, analyses]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/analyses`);
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter === selectedFilter ? "all" : filter);
  };

  const popularSearches = [
    "Plastic bottle", "Paper", "Glass", "Food waste", "Electronics", "Metal"
  ];

  const filterOptions = [
    { key: "all", label: "All", icon: "📦" },
    { key: "recyclable", label: "Recyclable", icon: "♻️" },
    { key: "organic", label: "Organic", icon: "🌱" },
    { key: "hazardous", label: "Hazardous", icon: "⚠️" },
    { key: "e-waste", label: "E-Waste", icon: "📱" }
  ];

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 pt-6 sm:pt-8 md:pt-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Search Analyses
            </h1>
          </div>
          <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base px-4">
            Find and explore your previous waste analysis results
          </p>
        </div>

        {/* Search Form - Modern Glass UI */}
        <div className="glass-card rounded-2xl shadow-lg border border-white/10 backdrop-blur-xl p-6 sm:p-8 bg-[#0c0c0c]">
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
              <Input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name, material type, or category..."
                className="pl-12 pr-12 py-3 sm:py-4 w-full rounded-xl text-base sm:text-lg bg-[#111111] border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-300" />
                </button>
              )}
            </div>

            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <p className="text-sm font-medium text-white">Popular searches:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term} 
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-gray-300 transition-all duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-medium text-white">Filter by category:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.key} 
                    onClick={() => handleFilterClick(filter.key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedFilter === filter.key 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg" 
                        : "bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/20 text-gray-300"
                    }`}
                  >
                    <span className="mr-1.5">{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="glass-card rounded-2xl shadow-lg border border-white/10 backdrop-blur-xl overflow-hidden bg-[#0c0c0c]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {searchQuery || selectedFilter !== "all" 
                    ? `Search Results (${filteredAnalyses.length})` 
                    : "Recent Analyses"}
                </h2>
              </div>
              {filteredAnalyses.length > 0 && (
                <div className="text-sm text-gray-400">
                  {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'result' : 'results'}
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {filteredAnalyses.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {filteredAnalyses.map((analysis, index) => (
                    <motion.div
                    key={analysis.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/dashboard/analysis/${analysis.id}`} className="block">
                        <div className="relative overflow-hidden p-4 sm:p-6 rounded-xl glass-card border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg group bg-[#191919]">
                          <div className="flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                              <Image 
                                src={analysis.imageUrl} 
                                alt={analysis.label || "Analysis"} 
                                width={80} 
                                height={80} 
                                className="object-cover w-full h-full"
                              />
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
                                {analysis.label || "Unnamed Item"}
                              </h3>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-medium border border-emerald-500/30">
                                  {analysis.type || "Unknown material"}
                                </span>
                                <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full font-medium border border-blue-500/30">
                                  {analysis.category || "Uncategorized"}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(analysis.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Action */}
                            <div className="flex-shrink-0">
                              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 sm:py-16"
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-white/10 flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchQuery || selectedFilter !== "all" ? "No results found" : "No analyses yet"}
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    {searchQuery || selectedFilter !== "all"
                      ? "Try adjusting your search terms or filters"
                      : "Upload an item to analyze and it will appear in your history"
                    }
                  </p>
                  {!searchQuery && selectedFilter === "all" && (
                    <Link href="/dashboard">
                      <Button className="bg-white text-[#0c0c0c] hover:bg-gray-100 rounded-lg px-6 py-2 font-medium">
                        <Zap className="h-4 w-4 mr-2" />
                        Upload First Item
                      </Button>
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 