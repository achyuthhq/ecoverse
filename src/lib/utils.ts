import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate eco awareness score based on analyses
export function calculateEcoAwarenessScore(analyses: any[]): number {
  if (!analyses || analyses.length === 0) {
    return 0;
  }

  let score = 0;
  
  // Base score from number of analyses
  score += analyses.length * 10;
  
  // Bonus points for recyclable items
  analyses.forEach((analysis) => {
    if (analysis.category?.toLowerCase().includes("recycl")) {
      score += 15;
    } else if (analysis.category?.toLowerCase().includes("compost")) {
      score += 12;
    } else if (analysis.category?.toLowerCase().includes("reuse")) {
      score += 10;
    } else {
      score += 5; // Base points for any analysis
    }
  });
  
  // Cap the score at 1000
  return Math.min(score, 1000);
}

// Get random greeting for user
export function getRandomGreeting(name: string): string {
  const greetings = [
    `Welcome back, ${name}! 🌱`,
    `Hello ${name}! Let's make a difference! 🌍`,
    `Hey ${name}! Ready to go green? ♻️`,
    `Welcome ${name}! Time to analyze! 🔍`,
    `Hi ${name}! Let's save the planet! 🌿`,
    `Greetings ${name}! Eco-warrior mode activated! ⚡`,
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Parse JSON array string to array
export function parseJsonArray(jsonString: string | null | undefined): any[] {
  if (!jsonString) {
    return [];
  }
  
  try {
    // If it's already an array, return it
    if (Array.isArray(jsonString)) {
      return jsonString;
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(jsonString);
    
    // If parsed result is an array, return it
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    // If it's a string that looks like an array, try to parse it again
    if (typeof parsed === 'string') {
      const reParsed = JSON.parse(parsed);
      return Array.isArray(reParsed) ? reParsed : [];
    }
    
    return [];
  } catch (error) {
    // If parsing fails, try to split by comma or newline
    if (typeof jsonString === 'string') {
      const split = jsonString.split(/[,\n]/).filter(item => item.trim());
      return split.length > 0 ? split : [];
    }
    
    return [];
  }
}

// Parse JSON object string to object
export function parseJsonObject(jsonString: string | null | undefined): any {
  if (!jsonString) {
    return {};
  }
  
  try {
    // If it's already an object, return it
    if (typeof jsonString === 'object' && !Array.isArray(jsonString)) {
      return jsonString;
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

// Format date to readable string
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "Unknown date";
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (error) {
    return "Invalid date";
  }
}

// Calculate impact metrics from analyses
export function calculateImpactMetrics(analyses: any[]) {
  if (!analyses || analyses.length === 0) {
    return {
      totalAnalyses: 0,
      totalCO2Saved: 0,
      totalWaterSaved: 0,
      totalWasteAnalyzed: 0,
      averageImpactScore: 0,
      recyclabilityRate: 0,
      totalEnergySaved: 0,
      itemsByCategory: {},
      itemsByMaterial: {},
      monthlyData: []
    };
  }

  let totalCO2 = 0;
  let totalWater = 0;
  let totalEnergy = 0;
  let totalImpactScore = 0;
  let recyclableCount = 0;
  const categoryCount: Record<string, number> = {};
  const materialCount: Record<string, number> = {};
  const monthlyDataMap: Record<string, { co2: number; water: number; analyses: number }> = {};

  analyses.forEach((analysis) => {
    // Parse extraNotes for AI-enhanced data
    let aiData = null;
    try {
      if (analysis.extraNotes && analysis.extraNotes.startsWith('{')) {
        aiData = JSON.parse(analysis.extraNotes);
      }
    } catch (e) {
      // Ignore parse errors
    }

    // CO2 equivalent
    if (aiData?.co2Equivalent) {
      totalCO2 += aiData.co2Equivalent;
    } else {
      // Estimate based on material type
      const material = (analysis.type || '').toLowerCase();
      if (material.includes('plastic')) totalCO2 += 3.5;
      else if (material.includes('metal')) totalCO2 += 2;
      else if (material.includes('paper')) totalCO2 += 1.2;
      else if (material.includes('electronic')) totalCO2 += 10;
      else totalCO2 += 2;
    }

    // Water usage
    if (aiData?.waterUsage) {
      totalWater += aiData.waterUsage;
    } else {
      // Estimate based on material type
      const material = (analysis.type || '').toLowerCase();
      if (material.includes('plastic')) totalWater += 150;
      else if (material.includes('metal')) totalWater += 300;
      else if (material.includes('paper')) totalWater += 30;
      else if (material.includes('electronic')) totalWater += 600;
      else totalWater += 100;
    }

    // Energy consumption
    if (aiData?.energyConsumption) {
      totalEnergy += aiData.energyConsumption;
    }

    // Impact score
    if (aiData?.impactScore) {
      totalImpactScore += aiData.impactScore;
    }

    // Recyclability
    if (aiData?.recyclability && aiData.recyclability > 50) {
      recyclableCount++;
    } else if (analysis.category?.toLowerCase().includes('recycl')) {
      recyclableCount++;
    }

    // Category tracking
    const category = analysis.category || 'Uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;

    // Material tracking
    const material = analysis.type || 'Unknown';
    materialCount[material] = (materialCount[material] || 0) + 1;

    // Monthly data
    const date = new Date(analysis.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { co2: 0, water: 0, analyses: 0 };
    }
    monthlyDataMap[monthKey].co2 += aiData?.co2Equivalent || 2;
    monthlyDataMap[monthKey].water += aiData?.waterUsage || 100;
    monthlyDataMap[monthKey].analyses += 1;
  });

  // Convert monthly data map to array
  const monthlyData = Object.entries(monthlyDataMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data
    }));

  return {
    totalAnalyses: analyses.length,
    totalCO2Saved: Math.round(totalCO2 * 10) / 10,
    totalWaterSaved: Math.round(totalWater),
    totalWasteAnalyzed: analyses.length, // Can be enhanced with weight estimates
    averageImpactScore: analyses.length > 0 ? Math.round((totalImpactScore / analyses.length) * 10) / 10 : 0,
    recyclabilityRate: analyses.length > 0 ? Math.round((recyclableCount / analyses.length) * 100) : 0,
    totalEnergySaved: Math.round(totalEnergy * 10) / 10,
    itemsByCategory: categoryCount,
    itemsByMaterial: materialCount,
    monthlyData
  };
}
