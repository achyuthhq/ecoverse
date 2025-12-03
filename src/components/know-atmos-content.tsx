"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Loader2, 
  MapPin, 
  Search, 
  Thermometer, 
  Droplet, 
  Wind, 
  Gauge,
  Eye,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Navigation,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input2";

// Types
interface RecyclingLocation {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    recycling_type?: string;
    opening_hours?: string;
    operator?: string;
    "recycling:glass"?: string;
    "recycling:paper"?: string;
    "recycling:plastic"?: string;
    "recycling:clothes"?: string;
    "recycling:electronics"?: string;
    [key: string]: string | undefined;
  };
  distance?: number;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
}

interface AirQualityData {
  aqi: number;
  level: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

export default function KnowAtmosContent() {
  const defaultLocation = { lat: 26.9124, lng: 75.7873 }; // Jaipur, Rajasthan
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recyclingLocations, setRecyclingLocations] = useState<RecyclingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RecyclingLocation | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const leafletLoadedRef = useRef(false);

  // Load Leaflet
  useEffect(() => {
    if (leafletLoadedRef.current) return;
    leafletLoadedRef.current = true;

    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';

    script.onload = () => {
      setTimeout(() => {
        if (hasSearched && mapContainerRef.current) {
          initializeMap();
        }
      }, 100);
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) document.body.removeChild(script);
      if (linkElement.parentNode) document.head.removeChild(linkElement);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (hasSearched && mapContainerRef.current && (window as any).L) {
      initializeMap();
    }
  }, [hasSearched, userLocation, recyclingLocations]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setHasSearched(true);
          fetchWeatherAndAQI(newLocation.lat, newLocation.lng);
          fetchRecyclingLocations(newLocation.lat, newLocation.lng);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please search for a location instead.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // Fetch weather and AQI data
  const fetchWeatherAndAQI = async (lat: number, lon: number) => {
    setIsWeatherLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      
      // Check if the response contains an error
      if (!response.ok || data.error) {
        const errorMessage = data.error || `Failed to fetch weather data (${response.status})`;
        throw new Error(errorMessage);
      }
      
      // Validate that we have the required data
      if (!data.weather || !data.airQuality) {
        throw new Error('Invalid weather data received from server');
      }
      
      setWeatherData(data.weather);
      setAirQuality(data.airQuality);
      setLocationName(data.location?.name || '');
      setIsWeatherLoading(false);
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      setError(error.message || 'Failed to load weather data');
      setIsWeatherLoading(false);
    }
  };

  // Fetch recycling locations from OpenStreetMap
  const fetchRecyclingLocations = async (lat: number, lon: number) => {
    setIsLocationsLoading(true);
    try {
      const radius = 5000; // 5km radius
      const url = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="recycling"](around:${radius},${lat},${lon});node["recycling"](around:${radius},${lat},${lon});way["amenity"="recycling"](around:${radius},${lat},${lon});way["recycling"](around:${radius},${lat},${lon}););out center;`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch recycling locations');

      const data = await response.json();
      const locations: RecyclingLocation[] = data.elements
        .map((element: any, index: number) => {
          const elementLat = element.lat || element.center?.lat;
          const elementLon = element.lon || element.center?.lon;
          
          if (!elementLat || !elementLon) return null;

          const distance = calculateDistance(lat, lon, elementLat, elementLon);
          
          return {
            id: element.id || index,
            lat: elementLat,
            lon: elementLon,
            tags: element.tags || {},
            distance: Math.round(distance * 10) / 10,
          };
        })
        .filter((loc: any) => loc !== null)
        .sort((a: RecyclingLocation, b: RecyclingLocation) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 20); // Limit to 20 closest

      setRecyclingLocations(locations);
      setIsLocationsLoading(false);
    } catch (error: any) {
      console.error('Error fetching recycling locations:', error);
      setError('Failed to load recycling locations');
      setIsLocationsLoading(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize map
  const initializeMap = () => {
    if (!mapContainerRef.current || !(window as any).L) return;

    const L = (window as any).L;

    // Remove existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create new map
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add user marker
    addUserMarker(L, map);
    
    // Add recycling markers
    if (recyclingLocations.length > 0) {
      addRecyclingMarkers(L, map);
    }
  };

  // Add user marker
  const addUserMarker = (L: any, map: any) => {
    try {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="text-center font-semibold">📍 Your Location</div>');

      userMarkerRef.current = marker;
    } catch (error) {
      console.error('Error adding user marker:', error);
    }
  };

  // Add recycling markers
  const addRecyclingMarkers = (L: any, map: any) => {
    try {
      markersRef.current.forEach(marker => {
        if (marker) marker.remove();
      });
      markersRef.current = [];

      const recyclingIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: white;
            font-weight: bold;
          ">♻</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      recyclingLocations.forEach((location) => {
        if (!location.lat || !location.lon || isNaN(location.lat) || isNaN(location.lon)) {
          return;
        }

        try {
          const marker = L.marker([location.lat, location.lon], { icon: recyclingIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-sm p-2 min-w-[200px]">
                <div class="font-semibold text-green-800 mb-2">
                  ${location.tags.name || "Recycling Point"}
                </div>
                <div class="text-gray-600 mb-1">
                  📍 ${location.distance} km away
                </div>
                ${location.tags.opening_hours ? `<div class="text-gray-600 mb-1">🕒 ${location.tags.opening_hours}</div>` : ''}
                <div class="text-gray-600 mb-2">
                  ♻️ ${getRecyclingMaterials(location.tags)}
                </div>
                ${location.tags.operator ? `<div class="text-xs text-gray-500">Operated by: ${location.tags.operator}</div>` : ''}
              </div>
            `);

          marker.on('click', () => {
            setSelectedLocation(location);
          });

          markersRef.current.push(marker);
        } catch (error) {
          console.warn('Error creating marker:', error);
        }
      });
    } catch (error) {
      console.error('Error adding recycling markers:', error);
    }
  };

  // Get recycling materials from tags
  const getRecyclingMaterials = (tags: any): string => {
    const materials: string[] = [];
    if (tags["recycling:glass"] === "yes") materials.push("Glass");
    if (tags["recycling:paper"] === "yes") materials.push("Paper");
    if (tags["recycling:plastic"] === "yes") materials.push("Plastic");
    if (tags["recycling:clothes"] === "yes") materials.push("Clothes");
    if (tags["recycling:electronics"] === "yes") materials.push("Electronics");
    return materials.length > 0 ? materials.join(", ") : "General";
  };

  // Search for location
  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError("Please enter a location to search");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Ecoverse-App/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search location: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error("Location not found. Please try a different search term.");
      }
      
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates received");
      }
      
      const newLocation = { lat, lng };
      setUserLocation(newLocation);
      setHasSearched(true);
      setLocationName(result.display_name || searchQuery);
      
      // Fetch weather, AQI, and recycling locations
      await Promise.all([
        fetchWeatherAndAQI(lat, lng),
        fetchRecyclingLocations(lat, lng),
      ]);
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || "Failed to search location");
      setIsLoading(false);
    }
  };

  // Get weather icon component
  const getWeatherIcon = (icon: string) => {
    const iconCode = icon.substring(0, 2);
    switch (iconCode) {
      case '01': return <Sun className="h-8 w-8 text-yellow-400" />;
      case '02': return <Cloud className="h-8 w-8 text-gray-400" />;
      case '03': case '04': return <Cloud className="h-8 w-8 text-gray-500" />;
      case '09': case '10': return <CloudRain className="h-8 w-8 text-blue-400" />;
      case '11': return <CloudLightning className="h-8 w-8 text-yellow-500" />;
      case '13': return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default: return <Sun className="h-8 w-8 text-yellow-400" />;
    }
  };

  // Get AQI color and icon
  const getAQIInfo = (aqi: number, level: string) => {
    if (aqi <= 1 || level === 'Good') {
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: CheckCircle2 };
    } else if (aqi === 2 || level === 'Fair') {
      return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: Info };
    } else if (aqi === 3 || level === 'Moderate') {
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: AlertCircle };
    } else if (aqi === 4 || level === 'Poor') {
      return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: AlertCircle };
    } else {
      return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: XCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="glass-card rounded-xl p-4 border border-white/10 backdrop-blur-md">
        <form onSubmit={searchLocation} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a location (e.g., Jaipur, Rajasthan)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="glass-card border border-white/10 hover:bg-white/10 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="glass-card border border-white/10 hover:bg-white/10 text-white"
            >
              <Navigation className="h-4 w-4 mr-2" />
              My Location
            </Button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="glass-card border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather and AQI Cards */}
      {(weatherData || isWeatherLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weather Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6 border border-white/10 backdrop-blur-md"
          >
            {isWeatherLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : weatherData ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Current Weather</h3>
                    <p className="text-sm text-gray-400">{locationName || 'Your Location'}</p>
                  </div>
                  {getWeatherIcon(weatherData.icon)}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-400" />
                      <span className="text-gray-300">Temperature</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{weatherData.temp}°C</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Humidity</p>
                        <p className="text-sm font-semibold text-white">{weatherData.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Wind</p>
                        <p className="text-sm font-semibold text-white">{weatherData.windSpeed} m/s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-400">Pressure</p>
                        <p className="text-sm font-semibold text-white">{weatherData.pressure} hPa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-indigo-400" />
                      <div>
                        <p className="text-xs text-gray-400">Visibility</p>
                        <p className="text-sm font-semibold text-white">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-sm text-gray-300 capitalize">{weatherData.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Feels like {weatherData.feelsLike}°C</p>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>

          {/* Air Quality Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6 border border-white/10 backdrop-blur-md"
          >
            {isWeatherLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : airQuality ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Air Quality</h3>
                    <p className="text-sm text-gray-400">Real-time AQI</p>
                  </div>
                  {(() => {
                    const aqiInfo = getAQIInfo(airQuality.aqi, airQuality.level);
                    const Icon = aqiInfo.icon;
                    return <Icon className={`h-8 w-8 ${aqiInfo.color}`} />;
                  })()}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">AQI Level</span>
                    {(() => {
                      const aqiInfo = getAQIInfo(airQuality.aqi, airQuality.level);
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${aqiInfo.bg} ${aqiInfo.border} border ${aqiInfo.color}`}>
                          {airQuality.level}
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">PM2.5</p>
                      <p className="text-lg font-bold text-white">{airQuality.pm25} μg/m³</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">PM10</p>
                      <p className="text-lg font-bold text-white">{airQuality.pm10} μg/m³</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">O₃</p>
                      <p className="text-lg font-bold text-white">{airQuality.o3} μg/m³</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">NO₂</p>
                      <p className="text-lg font-bold text-white">{airQuality.no2} μg/m³</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>SO₂: {airQuality.so2} μg/m³</span>
                      <span>CO: {airQuality.co} μg/m³</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      )}

      {/* Map and Recycling Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl overflow-hidden border border-white/10 backdrop-blur-md">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Map View</h3>
              {hasSearched && (
                <Button
                  onClick={() => {
                    if (userLocation) {
                      fetchWeatherAndAQI(userLocation.lat, userLocation.lng);
                      fetchRecyclingLocations(userLocation.lat, userLocation.lng);
                    }
                  }}
                  disabled={isLocationsLoading || isWeatherLoading}
                  className="h-8 px-3 text-xs glass-card border border-white/10 hover:bg-white/10 text-white"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${(isLocationsLoading || isWeatherLoading) ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
            <div className="relative">
              <div 
                ref={mapContainerRef}
                className="h-[500px] w-full bg-gray-900"
                style={{ minHeight: '500px' }}
              />
              {!hasSearched && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                  <div className="text-center p-6">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-white font-medium mb-2">Search for a location to view map</p>
                    <p className="text-sm text-gray-400">Find recycling points and environmental data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recycling Locations List */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl border border-white/10 backdrop-blur-md">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Recycling Points</h3>
              <p className="text-xs text-gray-400 mt-1">
                {recyclingLocations.length > 0 
                  ? `${recyclingLocations.length} locations found`
                  : 'No locations found'}
              </p>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
              {isLocationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : recyclingLocations.length > 0 ? (
                recyclingLocations.map((location) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedLocation(location)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedLocation?.id === location.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">
                        {location.tags.name || 'Recycling Point'}
                      </h4>
                      <span className="text-xs text-emerald-400 font-medium">
                        {location.distance} km
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      ♻️ {getRecyclingMaterials(location.tags)}
                    </p>
                    {location.tags.opening_hours && (
                      <p className="text-xs text-gray-500">🕒 {location.tags.opening_hours}</p>
                    )}
                  </motion.div>
                ))
              ) : hasSearched ? (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recycling points found nearby</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Search for a location to find recycling points</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

