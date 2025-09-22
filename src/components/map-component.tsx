"use client";

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the props interface
interface MapComponentProps {
  userLocation: { lat: number; lng: number };
  recyclingLocations: Array<{
    id: number;
    lat: number;
    lon: number;
    tags: {
      name?: string;
      opening_hours?: string;
      [key: string]: string | undefined;
    };
    distance?: number;
  }>;
  selectedLocation: {
    lat: number;
    lon: number;
  } | null;
  onMapReady?: () => void;
}

// Helper function to get recycling materials from location tags
const getRecyclingMaterials = (tags: { [key: string]: string | undefined }) => {
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

export default function MapComponent({
  userLocation,
  recyclingLocations,
  selectedLocation,
  onMapReady
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
  const [markers, setMarkers] = useState<Record<number, L.Marker>>({});

  // Initialize map
  useEffect(() => {
    // Ensure we're in the browser and the container exists
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    
    // Don't initialize twice
    if (map) return;
    
    // Fix Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
    
    // Initialize map with retry mechanism
    const initMap = () => {
      try {
        // Create map
        const leafletMap = L.map(mapContainerRef.current!, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 13
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMap);
        
        // Save map reference
        setMap(leafletMap);
        
        // Notify parent that map is ready
        if (onMapReady) {
          onMapReady();
        }
        
        return true;
      } catch (error) {
        console.error("Failed to initialize map:", error);
        return false;
      }
    };
    
    // Try to initialize map immediately
    const success = initMap();
    
    // If it fails, try again after a delay
    if (!success) {
      const retryTimes = [100, 500, 1000];
      retryTimes.forEach((delay, i) => {
        setTimeout(() => {
          if (!map) {
            console.log(`Retrying map initialization (attempt ${i + 1})...`);
            initMap();
          }
        }, delay);
      });
    }
    
    // Cleanup
    return () => {
      if (map) {
        // Use any to bypass TypeScript error
        (map as any).remove();
      }
    };
  }, [userLocation, onMapReady, map]);
  
  // Update map view when user location changes
  useEffect(() => {
    if (!map) return;
    
    map.setView([userLocation.lat, userLocation.lng], map.getZoom());
  }, [map, userLocation]);
  
  // Add user marker
  useEffect(() => {
    if (!map) return;
    
    // Remove existing marker
    if (userMarker) {
      userMarker.remove();
    }
    
    try {
      // Create user marker icon
      const userIcon = L.icon({
        iconUrl: '/markers/user-marker.svg',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
      
      // Add marker
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="text-center"><strong>Your Location</strong></div>');
      
      setUserMarker(marker);
    } catch (error) {
      console.error("Error adding user marker:", error);
    }
  }, [map, userLocation]);
  
  // Add recycling markers
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    Object.values(markers).forEach((marker: L.Marker) => {
      marker.remove();
    });
    
    const newMarkers: Record<number, L.Marker> = {};
    
    // Skip if no locations
    if (recyclingLocations.length === 0) {
      setMarkers(newMarkers);
      return;
    }
    
    try {
      // Create recycling marker icon
      const recyclingIcon = L.icon({
        iconUrl: '/markers/recycling-marker.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
      
      // Add markers for each location
      recyclingLocations.forEach(location => {
        if (typeof location.lat !== 'number' || typeof location.lon !== 'number' ||
            isNaN(location.lat) || isNaN(location.lon)) {
          return;
        }
        
        try {
          const marker = L.marker([location.lat, location.lon], { icon: recyclingIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-sm">
                <strong>${location.tags.name || "Recycling Point"}</strong>
                <p class="mt-1">
                  ${location.distance} km away
                  ${location.tags.opening_hours ? `<span class="block mt-1">Hours: ${location.tags.opening_hours}</span>` : ''}
                </p>
                <p class="mt-1">
                  ${getRecyclingMaterials(location.tags)}
                </p>
              </div>
            `);
          
          newMarkers[location.id] = marker;
        } catch (error) {
          console.warn(`Error creating marker for location ${location.id}:`, error);
        }
      });
      
      setMarkers(newMarkers);
    } catch (error) {
      console.error("Error adding recycling markers:", error);
    }
  }, [map, recyclingLocations]);
  
  // Handle selected location
  useEffect(() => {
    if (!map || !selectedLocation) return;
    
    try {
      // Find the marker for the selected location
      const selectedId = recyclingLocations.find(
        loc => loc.lat === selectedLocation.lat && loc.lon === selectedLocation.lon
      )?.id;
      
      if (selectedId && markers[selectedId]) {
        // Center map on selected location
        map.setView([selectedLocation.lat, selectedLocation.lon], 15);
        
        // Open popup
        markers[selectedId].openPopup();
      }
    } catch (error) {
      console.error("Error handling selected location:", error);
    }
  }, [map, selectedLocation, recyclingLocations, markers]);
  
  // Handle window resize
  useEffect(() => {
    if (!map) return;
    
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Also trigger resize after a short delay
    setTimeout(handleResize, 300);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  
  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '500px' }}
      className="rounded-xl overflow-hidden"
    />
  );
} 