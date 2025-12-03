"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, MapPin, Info, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button2";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input2";
import Head from "next/head";

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

export default function EventsContent() {
  // Default location (San Francisco)
  const defaultLocation = { lat: 37.7749, lng: -122.4194 };
  
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recyclingLocations, setRecyclingLocations] = useState<RecyclingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<RecyclingLocation | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const leafletLoadedRef = useRef(false);

  // Load Leaflet directly in the component
  useEffect(() => {
    // Only attempt to load once
    if (leafletLoadedRef.current) return;
    
    // Mark as attempted to load
    leafletLoadedRef.current = true;
    
    // Create a new link element for Leaflet CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);
    
    // Load Leaflet script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    // When script loads, initialize map if we have a location
    script.onload = () => {
      console.log('Leaflet script loaded');
      // Wait a bit to ensure DOM is ready
      setTimeout(() => {
        if (hasSearched && mapContainerRef.current) {
          initializeMap();
        }
      }, 100);
    };
    
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      if (linkElement.parentNode) {
        document.head.removeChild(linkElement);
      }
    };
  }, []);

  // Re-initialize map when location changes or after search
  useEffect(() => {
    if (hasSearched && mapContainerRef.current) {
      // Check if Leaflet is loaded
      if (typeof window !== 'undefined' && (window as any).L) {
        console.log('Initializing map after search');
        // Small delay to ensure DOM is ready
        setTimeout(initializeMap, 100);
      }
    }
  }, [userLocation, hasSearched]);

  // Add markers when recycling locations change
  useEffect(() => {
    if (recyclingLocations.length > 0 && mapInstanceRef.current && leafletLoadedRef.current) {
      console.log('Adding markers for', recyclingLocations.length, 'locations');
      const L = (window as any).L;
      addRecyclingMarkers(L, mapInstanceRef.current);
    }
  }, [recyclingLocations]);

  // Initialize the map
  const initializeMap = () => {
    console.log('Initializing map');
    
    // Make sure we have the DOM element and Leaflet is loaded
    if (!mapContainerRef.current || typeof window === 'undefined' || !(window as any).L) {
      console.error('Cannot initialize map: DOM element or Leaflet not available');
      return;
    }
    
    try {
      // Get Leaflet from window
      const L = (window as any).L;
      
      // Clean up previous map instance if it exists
      if (mapInstanceRef.current) {
        console.log('Removing existing map');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // Make sure the container has dimensions
      mapContainerRef.current.style.height = '500px';
      mapContainerRef.current.style.width = '100%';
      
      console.log('Creating new map');
      
      // Fix Leaflet's icon paths before creating any markers
      fixLeafletIconPath(L);
      
      // Create new map with explicit dimensions
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Store map instance
      mapInstanceRef.current = map;
      
      // Add markers
      addUserMarker(L, map);
      
      // Add recycling markers if we have locations
      if (recyclingLocations.length > 0) {
        console.log('Adding recycling markers during map initialization');
        addRecyclingMarkers(L, map);
      }
      
      // Force a resize after a short delay to ensure proper rendering
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 300);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please try refreshing the page.');
    }
  };

  // Fix Leaflet's icon path issues
  const fixLeafletIconPath = (L: any) => {
    // Fix the default icon paths that cause 404 errors
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  };

  // Add user marker to map
  const addUserMarker = (L: any, map: any) => {
    try {
      // Remove existing marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      // Create user icon - use default for reliability
      const userIcon = new L.Icon.Default();
      
      // Add marker
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="text-center"><strong>Searched Location</strong></div>');
      
      userMarkerRef.current = marker;
    } catch (error) {
      console.error('Error adding user marker:', error);
    }
  };

  // Add recycling markers to map
  const addRecyclingMarkers = (L: any, map: any) => {
    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker) marker.remove();
      });
      markersRef.current = [];
      
      // Create a better recycling icon
      const recyclingIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: #10B981; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
          ">♻</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      console.log(`Adding ${recyclingLocations.length} recycling markers to map`);
      
      // Add markers for each location
      recyclingLocations.forEach((location, index) => {
        if (!location.lat || !location.lon || isNaN(location.lat) || isNaN(location.lon)) {
          console.warn('Invalid coordinates for location:', location);
          return;
        }
        
        try {
          const marker = L.marker([location.lat, location.lon], { icon: recyclingIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-sm p-2">
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
          
          // Store location data on marker for easy access
          marker.locationData = location;
          
          marker.on('click', () => {
            console.log('Marker clicked:', location);
            setSelectedLocation(location);
          });
          
          markersRef.current.push(marker);
          console.log(`Added marker ${index + 1} for ${location.tags.name || 'Recycling Point'}`);
        } catch (error) {
          console.warn('Error creating marker for location:', location, error);
        }
      });
      
      console.log(`Successfully added ${markersRef.current.length} markers to map`);
    } catch (error) {
      console.error('Error adding recycling markers:', error);
    }
  };

  // Search for a location
  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError("Please enter a location to search");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Nominatim API which doesn't require an API key
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          // Add a user agent as required by Nominatim's usage policy
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
      
      // Use the first result
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates received");
      }
      
      const newLocation = { lat, lng };
      setUserLocation(newLocation);
      setHasSearched(true);
      
      // Fetch recycling locations
      await fetchRecyclingLocations(lat, lng);
    } catch (error: any) {
      console.error("Error searching location:", error);
      setError(`Search failed: ${error.message}`);
      setRecyclingLocations([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch recycling locations from Overpass API
  const fetchRecyclingLocations = async (lat: number, lng: number) => {
    try {
      setIsLocationsLoading(true);
      
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
        throw new Error(`Failed to fetch recycling locations: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter out locations with invalid coordinates
      const validLocations = data.elements.filter((location: RecyclingLocation) => {
        return typeof location.lat === 'number' && 
               typeof location.lon === 'number' && 
               !isNaN(location.lat) && 
               !isNaN(location.lon);
      });
      
      if (validLocations.length === 0) {
        setError("No recycling locations found in this area. Please try searching for a different location.");
        setRecyclingLocations([]);
        return;
      }
      
      // Calculate distance from user for valid locations
      const locationsWithDistance = validLocations.map((location: RecyclingLocation) => {
        const distance = calculateDistance(lat, lng, location.lat, location.lon);
        return { ...location, distance };
      });
      
      // Sort by distance
      const sortedLocations = locationsWithDistance.sort((a: RecyclingLocation, b: RecyclingLocation) => 
        (a.distance || 0) - (b.distance || 0)
      );
      
      setRecyclingLocations(sortedLocations);
      setError(null);
      
      // Re-initialize map with new markers if it exists
      if (mapInstanceRef.current && leafletLoadedRef.current) {
        const L = (window as any).L;
        addRecyclingMarkers(L, mapInstanceRef.current);
      }
    } catch (error: any) {
      console.error("Error fetching recycling locations:", error);
      setError(`Failed to fetch recycling locations: ${error.message}. Please try again later.`);
      setRecyclingLocations([]);
    } finally {
      setIsLocationsLoading(false);
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
  
  // View a location on map
  const viewLocationOnMap = (location: RecyclingLocation) => {
    console.log('Viewing location on map:', location);
    setSelectedLocation(location);
    
    if (mapInstanceRef.current && location.lat && location.lon) {
      // Pan to the location with a smooth animation
      mapInstanceRef.current.setView([location.lat, location.lon], 16, {
        animate: true,
        duration: 1
      });
      
      // Find and open the marker popup
      setTimeout(() => {
        markersRef.current.forEach(marker => {
          try {
            if (marker.locationData && marker.locationData.id === location.id) {
              console.log('Opening popup for marker:', location);
              marker.openPopup();
            }
          } catch (error) {
            console.error("Error opening popup:", error);
          }
        });
      }, 500); // Small delay to ensure map has panned
    } else {
      console.warn('Map not available or invalid coordinates');
    }
    
    // Also scroll to the card
    const element = document.getElementById(`location-${location.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <Head>
      <link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/icons/icon-192x192.png" />
<meta name="theme-color" content="#3b82f6" />

        <title>Find Recycling Locations | Ecoverse</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h2 className=" mt-5text-[15px] font-semibold">Search For Recycling Locations</h2>
          <form onSubmit={searchLocation} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Enter any location (e.g., 'Paris, France' or 'Bangkok, Thailand')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>
        
        {error && (
          <Alert variant={error.includes("No recycling locations") ? "destructive" : "default"}>
            <Info className="h-4 w-4" />
            <AlertTitle>
              {error.includes("No recycling locations") ? "No Results" : "Search Notice"}
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!hasSearched ? (
          <div
            className="flex items-center justify-center h-[400px] rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(12,12,12,0.65) 60%, rgba(25,25,25,0.85) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px 0 rgba(12,12,12,0.12), 0 1.5px 12px 0 rgba(25,25,25,0.21)",
              border: "1.5px solid rgba(255,255,255,0.08)"
            }}
          >
            <div className="text-center max-w-md mx-auto p-6">
              <MapPin className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white-900 mb-2">Search for a Location</h3>
              <p className="text-gray-500">
                Enter any location in the search bar above to find recycling locations nearby.
                Try cities, neighborhoods, or specific addresses.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Map Container */}
            <Card>
              <CardContent className="p-0 relative">
                <div 
                  ref={mapContainerRef} 
                  className="h-[500px] rounded-xl overflow-hidden bg-gray-50"
                  id="map-container"
                  style={{ position: 'relative' }}
                >
                  {!mapInstanceRef.current && hasSearched && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6">
                        <Loader2 className="h-10 w-10 text-green-500 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Loading Map</h3>
                        <p className="text-gray-500 mt-2">
                          If the map doesn't appear, please try refreshing the page.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 text-green-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Loading Map</h3>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Radius info */}
            <div className="text-center text-sm text-muted-foreground">
              Showing recycling locations within 10km radius of searched location
            </div>
            
            {/* Results list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {recyclingLocations.length} Recycling Locations Found
                </h2>
                {isLocationsLoading && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Finding locations...
                  </div>
                )}
              </div>
              
              {recyclingLocations.length === 0 && !isLoading ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No recycling locations found in this area.</p>
                  <p className="text-gray-500 mt-2">Try searching for a different location.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recyclingLocations.slice(0, 9).map((location, index) => (
                      <motion.div
                        key={location.id}
                        id={`location-${location.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`${selectedLocation?.id === location.id ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                      >
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-white-900">
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
                              onClick={() => viewLocationOnMap(location)}
                            >
                              View on Map
                            </Button>
                          </CardContent>
                        </Card>
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
                </>
              )}
            </div>
          </>
        )}
      </div>
      
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
        
        .leaflet-div-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </>
  );
} 