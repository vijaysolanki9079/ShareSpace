'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

/** Shared NGO shape for the map — decoupled from mock-data. */
export type MapNGO = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  distanceKm: number | null;
};

// Component to handle map movements (flying to user or fitting results)
function MapEffect({ ngos, userLocation }: { ngos: MapNGO[], userLocation: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      // If user picks a location, fly there
      map.flyTo(userLocation, 13, { animate: true, duration: 1.5 });
    } else if (ngos.length > 0) {
      // If there are search results, zoom to fit them
      const points = ngos.map(n => L.latLng(n.lat, n.lng));
      const bounds = L.latLngBounds(points);
      
      // If it's just one NGO, zoom in closer
      if (ngos.length === 1) {
        map.flyTo([ngos[0].lat, ngos[0].lng], 14, { animate: true, duration: 1.5 });
      } else {
        map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true, duration: 1.5 });
      }
    }
  }, [userLocation, ngos, map]);

  return userLocation === null ? null : (
    <Marker position={userLocation} icon={L.divIcon({
      className: 'bg-transparent',
      html: `<div class="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    })}>
      <Popup>Search Origin</Popup>
    </Marker>
  );
}

// Category Icons Mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Education': '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'Health': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  'Food': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/>',
  'Environment': '<path d="m12 10 1.4 1.4L18 7"/><path d="M4.5 15.5 10 21l11-11"/><path d="m9 7 2 2"/><path d="m5 11 2 2"/><path d="m11 10.3 4-4.3"/>',
  'Poverty': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'Default': '<path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m12 14 4-4"/>'
};

const getCategoryIconPath = (category: string) => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Default'];
};

// Default custom icon for NGOs
const createNgoIcon = (category: string) => {
  return L.divIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative group">
        <div class="absolute inset-0 bg-emerald-500 blur-md opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
        <div class="relative bg-emerald-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white transform hover:scale-110 transition-transform duration-300 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${getCategoryIconPath(category)}
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600 rotate-45 border-r border-b border-white"></div>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

type MapComponentProps = {
  ngos: MapNGO[];
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
        
        <MapEffect ngos={ngos} userLocation={userLocation} />
        
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
                  <span>Dist: <strong>{ngo.distanceKm != null ? `${ngo.distanceKm.toFixed(1)} km` : 'Nearby'}</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
