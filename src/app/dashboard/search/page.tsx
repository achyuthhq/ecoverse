"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Clock, ArrowRight, Filter, Sparkles, Zap, Target, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DashboardShell from "@/components/dashboard-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCodeAuth } from "@/lib/auth-utils";
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
  const { user, isLoading: authLoading } = useCodeAuth();
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <ClassicLoader size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 -z-10 rounded-xl opacity-50" />
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
              Search Analyses
            </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Find and explore your previous waste analysis results
          </p>
        </div>

        {/* Search Form - Modern Glass UI */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="relative">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name, material type, or category..."
                className="pl-12 pr-12 py-4 w-full border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 rounded-2xl text-lg bg-white/90 backdrop-blur-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Popular Searches */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium text-gray-700">Popular searches:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <Button 
                    key={term} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchQuery(term)}
                    className="rounded-full bg-white/80 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200"
                  >
                    {term}
            </Button>
                ))}
          </div>
          </div>

            {/* Filter Options */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium text-gray-700">Filter by category:</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <Button 
                    key={filter.key} 
                    variant={selectedFilter === filter.key ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handleFilterClick(filter.key)}
                    className={`rounded-full transition-all duration-200 ${
                      selectedFilter === filter.key 
                        ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg" 
                        : "bg-white/80 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                    }`}
                  >
                    <span className="mr-1">{filter.icon}</span>
                    {filter.label}
                </Button>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">
                  {searchQuery ? `Search Results (${filteredAnalyses.length})` : "Recent Analyses"}
                </h2>
              </div>
              {filteredAnalyses.length > 0 && (
                <div className="text-sm text-gray-500">
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
                        <div className="relative overflow-hidden p-6 rounded-2xl bg-white/60 hover:bg-white/80 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
                          {/* Glass effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                          
                          <div className="relative z-10 flex items-center">
                      {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                        <Image 
                          src={analysis.imageUrl} 
                          alt={analysis.label || "Analysis"} 
                                width={80} 
                                height={80} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      {/* Details */}
                            <div className="ml-6 flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                                {analysis.label || "Unnamed Item"}
                              </h3>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                            {analysis.type || "Unknown material"}
                          </span>
                                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {analysis.category || "Uncategorized"}
                          </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="flex-shrink-0">
                              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-400 text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
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
                  className="text-center py-16"
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-gray-400" />
                </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No results found" : "No analyses yet"}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    {searchQuery 
                      ? "Try adjusting your search terms or filters"
                      : "Upload an item to analyze and it will appear in your history"
                    }
                </p>
                  {!searchQuery && (
                    <Link href="/dashboard">
                      <Button className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 rounded-xl shadow-lg">
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