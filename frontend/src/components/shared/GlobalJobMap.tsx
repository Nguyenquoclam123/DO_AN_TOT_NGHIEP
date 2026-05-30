"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Briefcase, Building2, MapPin, Navigation, ExternalLink, Zap } from 'lucide-react';
import Link from 'next/link';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface Job {
    id: string;
    title: string;
    company: {
        name: string;
        logoUrl?: string;
        address: string;
        offices?: { label: string; address: string; lat?: number; lng?: number }[];
    };
    workLocation: string;
    type: string;
    minSalary?: number;
    maxSalary?: number;
}

interface GlobalJobMapProps {
    jobs: Job[];
    height?: string;
}

interface MarkerData {
    job: Job;
    position: [number, number];
    officeLabel: string;
    officeAddress: string;
}

export default function GlobalJobMap({ jobs, height = "600px" }: GlobalJobMapProps) {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        import('leaflet').then((leaflet) => {
            setL(leaflet);
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        });
    }, []);

    useEffect(() => {
        const processJobs = async () => {
            setLoading(true);
            const newMarkers: MarkerData[] = [];

            // Group jobs by company and office to avoid too many markers on same spot
            // But for simplicity in this demo, we'll just process each job's primary company address
            // or offices if available.
            
            for (const job of jobs) {
                if (!job.company) continue;

                const offices = job.company.offices && job.company.offices.length > 0 
                    ? job.company.offices 
                    : [{ label: 'Headquarters', address: job.company.address }];

                for (const office of offices) {
                    if (office.lat && office.lng) {
                        newMarkers.push({
                            job,
                            position: [office.lat, office.lng],
                            officeLabel: office.label,
                            officeAddress: office.address
                        });
                    } else {
                        // Geocode address if no coordinates
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(office.address)}`);
                            const data = await response.json();
                            if (data && data.length > 0) {
                                newMarkers.push({
                                    job,
                                    position: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
                                    officeLabel: office.label,
                                    officeAddress: office.address
                                });
                            }
                        } catch (error) {
                            console.error(`Geocoding failed for ${office.address}:`, error);
                        }
                    }
                }
            }

            setMarkers(newMarkers);
            setLoading(false);
        };

        if (jobs.length > 0) {
            processJobs();
        } else {
            setLoading(false);
        }
    }, [jobs]);

    if (loading || !L) {
        return (
            <div style={{ 
                height, 
                width: '100%', 
                backgroundColor: 'white', 
                borderRadius: '32px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    border: '4px solid #f1f5f9', 
                    borderTopColor: '#5C9AFF', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                }} />
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#0f172a', fontSize: '16px', fontWeight: 800, margin: '0 0 4px' }}>Mapping Opportunities</p>
                    <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Scanning global office locations...</p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const center: [number, number] = markers.length > 0 ? markers[0].position : [21.0285, 105.8542];

    return (
        <div style={{ height, width: '100%', borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <MapContainer 
                center={center} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, idx) => (
                    <Marker key={`${marker.job.id}-${idx}`} position={marker.position}>
                        <Popup minWidth={300}>
                            <div style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                        {marker.job.company.logoUrl ? (
                                            <img src={marker.job.company.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Building2 size={20} color="#5C9AFF" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>{marker.job.title}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{marker.job.company.name}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                                        <MapPin size={14} color="#5C9AFF" /> 
                                        <span>{marker.officeLabel}: {marker.officeAddress}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                                        <Briefcase size={14} color="#5C9AFF" />
                                        <span>{marker.job.type} • {marker.job.minSalary && marker.job.maxSalary ? `$${marker.job.minSalary/1000}k - $${marker.job.maxSalary/1000}k` : 'Competitive'}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/candidate/jobs/${marker.job.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                                        <button style={{ width: '100%', padding: '8px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            View Details <ExternalLink size={12} />
                                        </button>
                                    </Link>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.officeAddress)}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Navigation size={14} color="#64748b" />
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Float Overlay Info */}
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{markers.length} Active Positions Found</span>
            </div>
        </div>
    );
}
