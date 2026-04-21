import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

interface Garage {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  latitude: number;
  longitude: number;
  profileImageUrl?: string;
  distance?: number;
}

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  city: string | null;
  address: string | null;
  nearbyGarages: Garage[];
  isLoading: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
  fetchGarages: (city: string, coords?: { latitude: number; longitude: number }) => Promise<void>;
  setManualCity: (city: string) => Promise<void>;
  saveLocationToProfile: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Helper for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [nearbyGarages, setNearbyGarages] = useState<Garage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGarages = useCallback(async (targetCity: string, coords?: { latitude: number; longitude: number }) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/users/garages', { params: { city: targetCity } });
      let garages: Garage[] = res.data;

      if (coords) {
        garages = garages.map(g => ({
          ...g,
          distance: calculateDistance(coords.latitude, coords.longitude, g.latitude, g.longitude)
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setNearbyGarages(garages);
    } catch (err) {
      console.error('Failed to fetch garages:', err);
      setNearbyGarages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      let position: GeolocationPosition;
      try {
        // Try with high accuracy first, 15s timeout
        position = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
      } catch (err) {
        // Fallback to low accuracy if high accuracy fails or times out
        console.warn('High accuracy location failed, trying low accuracy...', err);
        position = await getPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
      }

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setLocation(coords);

      // Use OpenStreetMap Nominatim for free reverse geocoding
      // NOTE: Added User-Agent and Referer headers to comply with Nominatim's policy
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'MadGarage/1.0 (Web Service)'
          }
        }
      );
      const data = await res.json();
      
      if (data && data.address) {
        const cityName = data.address.city || data.address.town || data.address.suburb || data.address.state || 'Unknown City';
        const formattedAddr = data.display_name;
        
        setCity(cityName);
        setAddress(formattedAddr);
        await fetchGarages(cityName, coords);
      } else {
        setError('Location coordinates found, but address could not be resolved.');
      }
    } catch (err: any) {
      console.error('Location detection system failure:', err);
      const msg = err.code === 1 ? 'Location permission denied by user.' : 
                  err.code === 2 ? 'Location unavailable.' :
                  err.code === 3 ? 'Location detection timed out.' : 
                  (err.message || 'System error detecting location.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGarages]);

  const setManualCity = useCallback(async (targetCity: string) => {
    setCity(targetCity);
    setLocation(null); // Clear coordinates as they don't match the new city
    setAddress(null);
    await fetchGarages(targetCity);
  }, [fetchGarages]);

  const saveLocationToProfile = useCallback(async () => {
    if (!city) return;
    try {
      await apiClient.put('/users/profile', { city, address, latitude: location?.latitude, longitude: location?.longitude });
      alert('Location saved as default in your profile.');
    } catch (err) {
      console.error('Failed to save location to profile:', err);
      alert('Failed to save location.');
    }
  }, [city, address, location]);

  return (
    <LocationContext.Provider value={{ location, city, address, nearbyGarages, isLoading, error, detectLocation, fetchGarages, setManualCity, saveLocationToProfile }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
