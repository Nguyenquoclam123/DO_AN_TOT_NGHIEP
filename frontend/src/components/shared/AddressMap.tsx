"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Navigation, Loader2 } from 'lucide-react';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false });

// Helper component to fix map sizing issues
function InvalidateSize() {
    try {
        const { useMap } = require('react-leaflet');
        const map = useMap();
        
        useEffect(() => {
            if (!map) return;
            
            const timer = setTimeout(() => {
                try {
                    // Check if map container is still in DOM and map is initialized
                    if (map.getContainer()) {
                        map.invalidateSize();
                    }
                } catch (e) {
                    console.warn("Leaflet invalidateSize failed:", e);
                }
            }, 200);

            return () => clearTimeout(timer);
        }, [map]);
    } catch (e) {
        return null;
    }
    return null;
}

interface Office {
    label: string;
    address: string;
    lat?: number;
    lng?: number;
}

interface AddressMapProps {
    offices: Office[];
    height?: string;
}

export default function AddressMap({ offices, height = "400px" }: AddressMapProps) {
    const [markers, setMarkers] = useState<(Office & { position: [number, number] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [customIcon, setCustomIcon] = useState<any>(null);

    useEffect(() => {
        const initLeaflet = async () => {
            const L = await import('leaflet');
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="
                    background-color: #ef4444;
                    width: 32px;
                    height: 32px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                ">
                    <div style="
                        width: 12px;
                        height: 12px;
                        background-color: white;
                        border-radius: 50%;
                        transform: rotate(45deg);
                    "></div>
                </div>`,
                iconSize: [32, 45],
                iconAnchor: [16, 45],
                popupAnchor: [0, -42]
            });
            setCustomIcon(icon);
        };
        initLeaflet();
    }, []);

    useEffect(() => {
        const geocodeOffices = async () => {
            if (offices.length === 0) return;
            setLoading(true);
            const newMarkers: (Office & { position: [number, number] })[] = [];

            for (const office of offices) {
                if (office.lat && office.lng) {
                    newMarkers.push({ ...office, position: [office.lat, office.lng] });
                    continue;
                }

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(office.address)}`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        newMarkers.push({
                            ...office,
                            position: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
                        });
                    }
                } catch (error) {
                    console.error(`Geocoding failed for ${office.address}:`, error);
                }
            }

            setMarkers(newMarkers);
            setLoading(false);
        };
        geocodeOffices();
    }, [offices]);

    if (loading || !customIcon) {
        return (
            <div style={{ height, width: '100%', backgroundColor: '#f8fafc', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid #e2e8f0' }}>
                <Loader2 className="animate-spin" size={32} color="#5C9AFF" />
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Đang định vị địa điểm...</p>
            </div>
        );
    }

    const center: [number, number] = markers.length > 0 ? markers[0].position : [21.0285, 105.8542];

    return (
        <div style={{ height, width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <InvalidateSize />
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google'
                />
                {markers.map((marker, idx) => (
                    <Marker key={idx} position={marker.position} icon={customIcon}>
                        <Popup>
                            <div style={{ padding: '4px' }}>
                                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#1e3a8a' }}>{marker.label}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{marker.address}</p>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.address)}`} 
                                    target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#5C9AFF', textDecoration: 'none' }}
                                >
                                    <Navigation size={12} /> Dẫn đường
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
