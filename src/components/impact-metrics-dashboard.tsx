"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Droplet, 
  Zap, 
  Leaf, 
  Recycle, 
  BarChart3,
  ChevronDown,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { calculateImpactMetrics } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImpactMetricsDashboardProps {
  analyses: any[];
  city?: string;
  cityTotalAnalyses?: number;
}

const metricOptions = [
  { value: 'co2', label: 'CO₂ Saved (kg)', icon: Leaf, color: '#10b981' },
  { value: 'water', label: 'Water Saved (L)', icon: Droplet, color: '#3b82f6' },
  { value: 'analyses', label: 'Analyses Count', icon: BarChart3, color: '#8b5cf6' },
  { value: 'energy', label: 'Energy Saved (kWh)', icon: Zap, color: '#f59e0b' },
  { value: 'impact', label: 'Impact Score', icon: TrendingUp, color: '#ec4899' },
  { value: 'recyclability', label: 'Recyclability Rate (%)', icon: Recycle, color: '#06b6d4' },
];

export default function ImpactMetricsDashboard({ analyses, city, cityTotalAnalyses }: ImpactMetricsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState(metricOptions[0]);
  
  const metrics = useMemo(() => calculateImpactMetrics(analyses), [analyses]);

  // Prepare chart data based on selected metric
  const chartData = useMemo(() => {
    let data: { month: string; value: number; label: string }[] = [];

    if (selectedMetric.value === 'co2') {
      data = metrics.monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: item.co2,
        label: 'CO₂ Saved (kg)'
      }));
    } else if (selectedMetric.value === 'water') {
      data = metrics.monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: item.water,
        label: 'Water Saved (L)'
      }));
    } else if (selectedMetric.value === 'analyses') {
      data = metrics.monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: item.analyses,
        label: 'Analyses Count'
      }));
    } else if (selectedMetric.value === 'energy') {
      // Estimate energy from CO2 (1 kg CO2 ≈ 0.5 kWh)
      data = metrics.monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.round(item.co2 * 0.5 * 10) / 10,
        label: 'Energy Saved (kWh)'
      }));
    } else if (selectedMetric.value === 'impact') {
      // Calculate average impact score per month
      data = metrics.monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.round((metrics.averageImpactScore || 50) * 10) / 10,
        label: 'Impact Score'
      }));
    } else if (selectedMetric.value === 'recyclability') {
      // Use recyclability rate
      data = metrics.monthlyData.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: metrics.recyclabilityRate,
        label: 'Recyclability Rate (%)'
      }));
    }

    // If we only have a single month of data, add a baseline month at 0
    // so the chart visually flows from zero up to the current value.
    if (data.length === 1 && metrics.monthlyData.length === 1) {
      const onlyMonth = metrics.monthlyData[0].month; // format: YYYY-MM
      const [yearStr, monthStr] = onlyMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr); // 1-12

      if (!Number.isNaN(year) && !Number.isNaN(month)) {
        const baselineDate = new Date(year, month - 2, 1); // previous month
        const baselineLabel = baselineDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        data = [
          {
            month: baselineLabel,
            value: 0,
            label: data[0].label,
          },
          data[0],
        ];
      }
    }

    return data;
  }, [selectedMetric, metrics]);

  // Get current value for selected metric
  const getCurrentValue = () => {
    switch (selectedMetric.value) {
      case 'co2':
        return metrics.totalCO2Saved;
      case 'water':
        return metrics.totalWaterSaved;
      case 'analyses':
        return metrics.totalAnalyses;
      case 'energy':
        return metrics.totalEnergySaved || Math.round(metrics.totalCO2Saved * 0.5 * 10) / 10;
      case 'impact':
        return metrics.averageImpactScore;
      case 'recyclability':
        return metrics.recyclabilityRate;
      default:
        return 0;
    }
  };

  const SelectedIcon = selectedMetric.icon;

  // Calculate trends and insights
  const insights = useMemo(() => {
    if (metrics.monthlyData.length < 2) {
      return {
        trend: 'neutral',
        growth: 0,
        message: 'Keep analyzing to see trends!'
      };
    }

    const recent = metrics.monthlyData.slice(-2);
    const current = recent[recent.length - 1];
    const previous = recent[recent.length - 2];
    
    let currentValue = 0;
    let previousValue = 0;

    if (selectedMetric.value === 'co2') {
      currentValue = current.co2;
      previousValue = previous.co2;
    } else if (selectedMetric.value === 'water') {
      currentValue = current.water;
      previousValue = previous.water;
    } else if (selectedMetric.value === 'analyses') {
      currentValue = current.analyses;
      previousValue = previous.analyses;
    } else if (selectedMetric.value === 'energy') {
      currentValue = current.co2 * 0.5;
      previousValue = previous.co2 * 0.5;
    }

    const growth = previousValue > 0 
      ? ((currentValue - previousValue) / previousValue) * 100 
      : currentValue > 0 ? 100 : 0;

    return {
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral',
      growth: Math.abs(growth),
      message: growth > 0 
        ? `Great progress! ${growth.toFixed(1)}% increase this month`
        : growth < 0
        ? `${Math.abs(growth).toFixed(1)}% decrease - let's improve!`
        : 'Steady progress maintained'
    };
  }, [metrics.monthlyData, selectedMetric.value]);

  // Calculate additional quick stats
  const quickStats = useMemo(() => {
    const energySaved = metrics.totalEnergySaved || Math.round(metrics.totalCO2Saved * 0.5 * 10) / 10;
    const avgImpact = metrics.averageImpactScore || 0;
    
    return {
      energy: energySaved,
      impact: avgImpact,
      itemsThisMonth: metrics.monthlyData.length > 0 
        ? metrics.monthlyData[metrics.monthlyData.length - 1]?.analyses || 0
        : 0
    };
  }, [metrics]);

  return (
    <div className="glass-card rounded-xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg glass-card border border-white/10 backdrop-blur-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Impact Metrics</h2>
              <p className="text-sm text-gray-400">
                {city
                  ? `You are viewing combined impact for ${city}.`
                  : "Track your environmental contribution"}
              </p>
            </div>
          </div>
          
          {/* Metric Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border border-white/10 hover:bg-white/5 transition-colors text-white text-sm font-medium backdrop-blur-md">
                <SelectedIcon className="h-4 w-4" />
                <span>{selectedMetric.label}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border border-white/10 min-w-[200px] backdrop-blur-xl">
              {metricOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedMetric(option)}
                    className={`flex items-center gap-2 cursor-pointer ${
                      selectedMetric.value === option.value 
                        ? 'bg-white/10 text-white' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <OptionIcon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Current Value Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{getCurrentValue()}</span>
            <span className="text-gray-400 text-sm">
              {selectedMetric.value === 'co2' ? 'kg' :
               selectedMetric.value === 'water' ? 'L' :
               selectedMetric.value === 'analyses' ? 'items' :
               selectedMetric.value === 'energy' ? 'kWh' :
               selectedMetric.value === 'impact' ? '/100' :
               '%'}
            </span>
          </div>
          <p className="text-sm text-gray-400">{selectedMetric.label}</p>
        </div>

        {/* Chart and Stats Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart - Narrower, Taller */}
          <div className="lg:w-2/3 h-96 relative">
            {chartData.length > 0 ? (
              <div className="relative h-full w-full glass-card rounded-xl p-4 border border-white/10 backdrop-blur-md">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      {/* Modern gradient with multiple stops for depth */}
                      <linearGradient id={`color${selectedMetric.value}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={selectedMetric.color} stopOpacity={0.8}/>
                        <stop offset="30%" stopColor={selectedMetric.color} stopOpacity={0.5}/>
                        <stop offset="60%" stopColor={selectedMetric.color} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={selectedMetric.color} stopOpacity={0}/>
                      </linearGradient>
                      {/* Glow effect */}
                      <filter id={`glow${selectedMetric.value}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255,255,255,0.08)" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="month" 
                      stroke="rgba(255,255,255,0.4)"
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)"
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'dataMax']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                      cursor={{ stroke: selectedMetric.color, strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={selectedMetric.color}
                      strokeWidth={3}
                      fill={`url(#color${selectedMetric.value})`}
                      filter={`url(#glow${selectedMetric.value})`}
                      dot={{ fill: selectedMetric.color, r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: selectedMetric.color, strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 glass-card rounded-xl border border-white/10 backdrop-blur-md">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available yet</p>
                  <p className="text-xs mt-1">Start analyzing items to see your impact!</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats - Right Side (Compact) */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            {/* Compact Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-lg p-3 border border-white/10 backdrop-blur-md hover:bg-white/5 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded-md bg-white/10 border border-white/20">
                    <Package className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Items</p>
                </div>
                <p className="text-lg font-bold text-white">{metrics.totalAnalyses}</p>
              </div>
              
              <div className="glass-card rounded-lg p-3 border border-white/10 backdrop-blur-md hover:bg-white/5 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                    <Leaf className="h-3 w-3 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">CO₂</p>
                </div>
                <p className="text-lg font-bold text-white">{metrics.totalCO2Saved}<span className="text-xs text-gray-400 font-normal ml-0.5">kg</span></p>
              </div>
              
              <div className="glass-card rounded-lg p-3 border border-white/10 backdrop-blur-md hover:bg-white/5 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded-md bg-blue-500/20 border border-blue-500/30">
                    <Droplet className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Water</p>
                </div>
                <p className="text-lg font-bold text-white">{metrics.totalWaterSaved}<span className="text-xs text-gray-400 font-normal ml-0.5">L</span></p>
              </div>
              
              <div className="glass-card rounded-lg p-3 border border-white/10 backdrop-blur-md hover:bg-white/5 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="p-1 rounded-md bg-cyan-500/20 border border-cyan-500/30">
                    <Recycle className="h-3 w-3 text-cyan-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Recycle</p>
                </div>
                <p className="text-lg font-bold text-white">{metrics.recyclabilityRate}<span className="text-xs text-gray-400 font-normal ml-0.5">%</span></p>
              </div>
            </div>

            {/* Trend Insight Card */}
            <div className="glass-card rounded-xl p-4 border border-white/10 backdrop-blur-md mt-2">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <TrendingUp className="h-4 w-4 text-purple-300" />
                  </div>
                  <p className="text-xs font-semibold text-white">Monthly Trend</p>
                </div>
                {insights.trend === 'up' && (
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                )}
                {insights.trend === 'down' && (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                {insights.trend === 'neutral' && (
                  <div className="h-4 w-4 rounded-full bg-gray-400/30" />
                )}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{insights.message}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="glass-card rounded-lg p-3 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <p className="text-[10px] text-gray-400 font-medium">Energy</p>
                </div>
                <p className="text-base font-bold text-white">{quickStats.energy}<span className="text-xs text-gray-400 font-normal ml-0.5">kWh</span></p>
              </div>
              
              <div className="glass-card rounded-lg p-3 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="h-3 w-3 text-pink-400" />
                  <p className="text-[10px] text-gray-400 font-medium">
                    {city ? "City Waste Score" : "Impact"}
                  </p>
                </div>
                {city ? (
                  <p className="text-base font-bold text-white">
                    {cityTotalAnalyses ?? 0}
                    <span className="text-xs text-gray-400 font-normal ml-0.5">
                      items analyzed in {city}
                    </span>
                  </p>
                ) : (
                  <p className="text-base font-bold text-white">
                    {quickStats.impact.toFixed(1)}
                    <span className="text-xs text-gray-400 font-normal ml-0.5">/100</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

