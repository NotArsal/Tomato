import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, InfoWindow } from '@react-google-maps/api';
import './LiveMap.css';

/**
 * 💡 Reminder: Ensure "Maps JavaScript API" and "Places API" are enabled in Google Cloud Console.
 * A Map ID is also required for Advanced Markers.
 */
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_MAP_ID || 'DEMO_MAP_ID';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 18.5204, lng: 73.8567 }; // Pune, Maharashtra

const LiveMap = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  customerName,
  restaurantName,
  height = '400px',
  showPhase = 'all'
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: ['marker']
  });

  const mapRef = useRef(null);
  const markersRef = useRef({ driver: null, restaurant: null, customer: null });
  const [activeInfo, setActiveInfo] = useState(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Update Markers using AdvancedMarkerElement
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    // Helper to create/update marker
    const syncMarker = (key, location, title, iconUrl) => {
      if (!location || location.length !== 2) {
        if (markersRef.current[key]) {
          markersRef.current[key].map = null;
          markersRef.current[key] = null;
        }
        return;
      }

      const position = { lat: location[1], lng: location[0] };

      if (markersRef.current[key]) {
        markersRef.current[key].position = position;
      } else {
        const img = document.createElement('img');
        img.src = iconUrl;
        img.style.width = '32px';
        img.style.height = '32px';

        const marker = new AdvancedMarkerElement({
          map: mapRef.current,
          position: position,
          title: title,
          content: img
        });

        marker.addListener('click', () => setActiveInfo(key));
        markersRef.current[key] = marker;
      }
    };

    syncMarker('driver', driverLocation, 'You (Driver)', 'https://cdn-icons-png.flaticon.com/128/3097/3097180.png');
    syncMarker('restaurant', restaurantLocation, restaurantName || 'Restaurant', 'https://cdn-icons-png.flaticon.com/128/3448/3448609.png');
    syncMarker('customer', customerLocation, customerName || 'Customer', 'https://cdn-icons-png.flaticon.com/128/1673/1673221.png');

  }, [isLoaded, driverLocation, restaurantLocation, customerLocation, restaurantName, customerName]);

  // Auto-fit bounds
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    if (driverLocation?.length === 2) {
      bounds.extend({ lat: driverLocation[1], lng: driverLocation[0] });
      hasPoints = true;
    }
    if (restaurantLocation?.length === 2 && (showPhase === 'all' || showPhase === 'pickup')) {
      bounds.extend({ lat: restaurantLocation[1], lng: restaurantLocation[0] });
      hasPoints = true;
    }
    if (customerLocation?.length === 2 && (showPhase === 'all' || showPhase === 'delivery')) {
      bounds.extend({ lat: customerLocation[1], lng: customerLocation[0] });
      hasPoints = true;
    }

    if (hasPoints) {
      mapRef.current.fitBounds(bounds, { padding: 60 });
    }
  }, [driverLocation, restaurantLocation, customerLocation, showPhase]);

  const routePath = [];
  if (showPhase === 'pickup') {
    if (driverLocation?.length === 2) routePath.push({ lat: driverLocation[1], lng: driverLocation[0] });
    if (restaurantLocation?.length === 2) routePath.push({ lat: restaurantLocation[1], lng: restaurantLocation[0] });
  } else if (showPhase === 'delivery') {
    if (driverLocation?.length === 2) routePath.push({ lat: driverLocation[1], lng: driverLocation[0] });
    if (customerLocation?.length === 2) routePath.push({ lat: customerLocation[1], lng: customerLocation[0] });
  } else {
    if (restaurantLocation?.length === 2) routePath.push({ lat: restaurantLocation[1], lng: restaurantLocation[0] });
    if (driverLocation?.length === 2) routePath.push({ lat: driverLocation[1], lng: driverLocation[0] });
    if (customerLocation?.length === 2) routePath.push({ lat: customerLocation[1], lng: customerLocation[0] });
  }

  if (!isLoaded) {
    return <div className="live-map-loading" style={{ height }}>Loading map...</div>;
  }

  return (
    <div className="live-map" style={{ height, borderRadius: '12px', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverLocation ? { lat: driverLocation[1], lng: driverLocation[0] } : defaultCenter}
        zoom={14}
        onLoad={onLoad}
        options={{
          mapId: MAP_ID,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        }}
      >
        {activeInfo === 'driver' && driverLocation && (
          <InfoWindow position={{ lat: driverLocation[1], lng: driverLocation[0] }} onCloseClick={() => setActiveInfo(null)}>
            <div style={{ fontWeight: 600 }}>🚚 You (Driver)</div>
          </InfoWindow>
        )}
        {activeInfo === 'restaurant' && restaurantLocation && (
          <InfoWindow position={{ lat: restaurantLocation[1], lng: restaurantLocation[0] }} onCloseClick={() => setActiveInfo(null)}>
            <div><strong>📍 Pickup</strong><br/>{restaurantName || 'Restaurant'}</div>
          </InfoWindow>
        )}
        {activeInfo === 'customer' && customerLocation && (
          <InfoWindow position={{ lat: customerLocation[1], lng: customerLocation[0] }} onCloseClick={() => setActiveInfo(null)}>
            <div><strong>🏠 Drop-off</strong><br/>{customerName || 'Customer'}</div>
          </InfoWindow>
        )}

        {routePath.length >= 2 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: showPhase === 'pickup' ? '#f59e0b' : showPhase === 'delivery' ? '#22c55e' : '#e23744',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default LiveMap;

