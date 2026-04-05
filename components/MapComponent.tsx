'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NGO } from '@/lib/mock-data';

// Component to dynamically fly to location
function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={L.divIcon({
      className: 'bg-transparent',
      html: `<div class="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    })}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

// Default custom icon for NGOs
const createNgoIcon = (category: string) => {
  return L.divIcon({
    className: 'bg-transparent',
    html: `<div class="bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

type MapComponentProps = {
  ngos: NGO[];
  userLocation: [number, number] | null;
};

export default function MapComponent({ ngos, userLocation }: MapComponentProps) {
  // Default center at Delhi
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  const center = userLocation || defaultCenter;

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-inner border border-gray-200 isolate z-0 relative">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="w-full h-full absolute inset-0 !z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <LocationMarker position={userLocation} />}
        
        {ngos.map((ngo) => (
          <Marker 
            key={ngo.id} 
            position={[ngo.lat, ngo.lng]}
            icon={createNgoIcon(ngo.category)}
          >
            <Popup className="rounded-lg border-none shadow-md">
              <div className="font-sans px-1 pb-1">
                <h3 className="font-extrabold text-sm text-gray-900 m-0 leading-tight">{ngo.name}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1 mb-1">{ngo.category}</p>
                <div className="mt-2 text-xs flex justify-between items-center text-gray-600 border-t border-gray-100 pt-2">
                  <span>Dist: <strong>{ngo.distanceKm.toFixed(1)} km</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
