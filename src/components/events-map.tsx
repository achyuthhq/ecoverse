"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types for recycling locations
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

// Dynamically import the Map component to prevent SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-xl">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-green-500 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Loading Map</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2">
          Preparing the map...
        </p>
      </div>
    </div>
  ),
});

export default function EventsMap() {
  // Default location (San Francisco) if geolocation fails
  const defaultLocation: [number, number] = [37.7749, -122.4194];
  
  const [userLocation, setUserLocation] = useState<[number, number]>(defaultLocation);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recyclingLocations, setRecyclingLocations] = useState<RecyclingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RecyclingLocation | null>(null);
  
  // Get user's location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (typeof window !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              if (latitude && longitude) {
                setUserLocation([latitude, longitude]);
                fetchRecyclingLocations(latitude, longitude);
              } else {
                // Fallback to default if coordinates are invalid
                setError("Invalid coordinates received. Using default location.");
                setUserLocation(defaultLocation);
                fetchRecyclingLocations(defaultLocation[0], defaultLocation[1]);
              }
              setIsLoading(false);
            },
            (error) => {
              console.error("Geolocation error:", error);
              setError("Unable to get your location. Using default location instead.");
              setUserLocation(defaultLocation);
              fetchRecyclingLocations(defaultLocation[0], defaultLocation[1]);
              setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          setError("Geolocation is not supported by your browser. Using default location instead.");
          setUserLocation(defaultLocation);
          fetchRecyclingLocations(defaultLocation[0], defaultLocation[1]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setError("An error occurred while getting your location. Using default location.");
        setUserLocation(defaultLocation);
        fetchRecyclingLocations(defaultLocation[0], defaultLocation[1]);
        setIsLoading(false);
      }
    };

    getUserLocation();
  }, []);
  
  // Fetch recycling locations from Overpass API
  const fetchRecyclingLocations = async (lat: number, lng: number) => {
    try {
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="recycling"](around:10000,${lat},${lng});
          node["recycling_type"~"centre|container"](around:10000,${lat},${lng});
          way["amenity"="recycling"](around:10000,${lat},${lng});
          relation["amenity"="recycling"](around:10000,${lat},${lng});
        );
        out body;
      `;
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch recycling locations");
      }
      
      const data = await response.json();
      
      // Calculate distance from user
      const locationsWithDistance = data.elements.map((location: RecyclingLocation) => {
        const distance = calculateDistance(lat, lng, location.lat, location.lon);
        return { ...location, distance };
      });
      
      // Sort by distance
      const sortedLocations = locationsWithDistance.sort((a: RecyclingLocation, b: RecyclingLocation) => 
        (a.distance || 0) - (b.distance || 0)
      );
      
      setRecyclingLocations(sortedLocations);
    } catch (error) {
      console.error("Error fetching recycling locations:", error);
      setError("Failed to fetch recycling locations. Please try again later.");
    }
  };
  
  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1));
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };
  
  // Get recycling materials from location tags
  const getRecyclingMaterials = (tags: RecyclingLocation['tags']) => {
    const materials: string[] = [];
    
    for (const [key, value] of Object.entries(tags)) {
      if (key.startsWith('recycling:') && value === 'yes') {
        materials.push(key.replace('recycling:', ''));
      }
    }
    
    return materials.length > 0 
      ? materials.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
      : 'General recycling';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-green-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading Map</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Finding recycling locations near you...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Map Container */}
      <div className="h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <MapComponent 
          userLocation={{ lat: userLocation[0], lng: userLocation[1] }} 
          recyclingLocations={recyclingLocations}
          selectedLocation={selectedLocation}
        />
      </div>
      
      {/* Radius info */}
      <div className="text-center text-sm text-gray-500">
        Showing recycling locations within 10km radius
      </div>
      
      {/* Results list */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {recyclingLocations.length} Recycling Locations Found
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recyclingLocations.slice(0, 9).map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {location.tags.name || "Recycling Point"}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{location.distance} km away</span>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {location.tags.recycling_type || "General"}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600">
                    <strong>Materials:</strong> {getRecyclingMaterials(location.tags)}
                  </div>
                  {location.tags.opening_hours && (
                    <div className="text-xs text-gray-600 mt-1">
                      <strong>Hours:</strong> {location.tags.opening_hours}
                    </div>
                  )}
                  {location.tags.operator && (
                    <div className="text-xs text-gray-600 mt-1">
                      <strong>Operator:</strong> {location.tags.operator}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setSelectedLocation(location)}
                >
                  View on Map
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {recyclingLocations.length > 9 && (
          <div className="text-center mt-4">
            <Button variant="outline">
              Load More Locations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 