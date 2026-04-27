import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import './LiveMap.css';

const GOOGLE_MAPS_KEY = 'AIzaSyBa5hsgwMhsOgCQcjrl5w5tcgjqY1v56lE'; // Using same Firebase API key

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 12.9716, lng: 77.5946 };

const LiveMap = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  customerName,
  restaurantName,
  height = '400px',
  showPhase = 'all' // 'pickup' = show route to restaurant, 'delivery' = show route to customer, 'all' = show all
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY
  });

  const mapRef = useRef(null);
  const [activeInfo, setActiveInfo] = useState(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Auto-fit bounds when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    if (driverLocation && driverLocation.length === 2) {
      bounds.extend({ lat: driverLocation[1], lng: driverLocation[0] });
      hasPoints = true;
    }
    if (restaurantLocation && restaurantLocation.length === 2 && (showPhase === 'all' || showPhase === 'pickup')) {
      bounds.extend({ lat: restaurantLocation[1], lng: restaurantLocation[0] });
      hasPoints = true;
    }
    if (customerLocation && customerLocation.length === 2 && (showPhase === 'all' || showPhase === 'delivery')) {
      bounds.extend({ lat: customerLocation[1], lng: customerLocation[0] });
      hasPoints = true;
    }

    if (hasPoints) {
      mapRef.current.fitBounds(bounds, { padding: 60 });
    }
  }, [driverLocation, restaurantLocation, customerLocation, showPhase]);

  // Build the route path based on phase
  const routePath = [];
  if (showPhase === 'pickup') {
    if (driverLocation?.length === 2)
      routePath.push({ lat: driverLocation[1], lng: driverLocation[0] });
    if (restaurantLocation?.length === 2)
      routePath.push({ lat: restaurantLocation[1], lng: restaurantLocation[0] });
  } else if (showPhase === 'delivery') {
    if (driverLocation?.length === 2)
      routePath.push({ lat: driverLocation[1], lng: driverLocation[0] });
    if (customerLocation?.length === 2)
      routePath.push({ lat: customerLocation[1], lng: customerLocation[0] });
  } else {
    if (restaurantLocation?.length === 2)
      routePath.push({ lat: restaurantLocation[1], lng: restaurantLocation[0] });
    if (driverLocation?.length === 2)
      routePath.push({ lat: driverLocation[1], lng: driverLocation[0] });
    if (customerLocation?.length === 2)
      routePath.push({ lat: customerLocation[1], lng: customerLocation[0] });
  }

  if (!isLoaded) {
    return <div className="live-map" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '12px' }}>Loading map...</div>;
  }

  return (
    <div className="live-map" style={{ height, borderRadius: '12px', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverLocation ? { lat: driverLocation[1], lng: driverLocation[0] } : defaultCenter}
        zoom={14}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
          ]
        }}
      >
        {/* Driver Marker */}
        {driverLocation && driverLocation.length === 2 && (
          <Marker
            position={{ lat: driverLocation[1], lng: driverLocation[0] }}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/128/3097/3097180.png',
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40)
            }}
            onClick={() => setActiveInfo('driver')}
          >
            {activeInfo === 'driver' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}>
                <div style={{ fontWeight: 600 }}>🚚 You (Driver)</div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Restaurant Marker */}
        {restaurantLocation && restaurantLocation.length === 2 && (
          <Marker
            position={{ lat: restaurantLocation[1], lng: restaurantLocation[0] }}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/128/3448/3448609.png',
              scaledSize: new window.google.maps.Size(36, 36),
              anchor: new window.google.maps.Point(18, 36)
            }}
            onClick={() => setActiveInfo('restaurant')}
          >
            {activeInfo === 'restaurant' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}>
                <div><strong>📍 Pickup</strong><br/>{restaurantName || 'Restaurant'}</div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLocation && customerLocation.length === 2 && (
          <Marker
            position={{ lat: customerLocation[1], lng: customerLocation[0] }}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/128/1673/1673221.png',
              scaledSize: new window.google.maps.Size(36, 36),
              anchor: new window.google.maps.Point(18, 36)
            }}
            onClick={() => setActiveInfo('customer')}
          >
            {activeInfo === 'customer' && (
              <InfoWindow onCloseClick={() => setActiveInfo(null)}>
                <div><strong>🏠 Drop-off</strong><br/>{customerName || 'Customer'}</div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Route Line */}
        {routePath.length >= 2 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: showPhase === 'pickup' ? '#f59e0b' : showPhase === 'delivery' ? '#22c55e' : '#e23744',
              strokeWeight: 4,
              strokeOpacity: 0.8,
              icons: [{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                offset: '0',
                repeat: '15px'
              }]
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default LiveMap;
