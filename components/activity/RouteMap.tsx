"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
    latlng: [number, number][];
    activityType: string;
}

export function RouteMap({ latlng, activityType }: RouteMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !latlng || latlng.length === 0) return;

        // Initialize map
        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current, {
                zoomControl: true,
                scrollWheelZoom: false,
            });

            // Add tile layer (OpenStreetMap)
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(mapRef.current);
        }

        // Clear existing layers
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
                mapRef.current?.removeLayer(layer);
            }
        });

        // Add route polyline
        const routeColor = getRouteColor(activityType);
        const polyline = L.polyline(latlng, {
            color: routeColor,
            weight: 4,
            opacity: 0.8,
        }).addTo(mapRef.current);

        // Add start marker
        const startIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">S</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        L.marker(latlng[0], { icon: startIcon }).addTo(mapRef.current);

        // Add finish marker
        const finishIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">F</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        L.marker(latlng[latlng.length - 1], { icon: finishIcon }).addTo(mapRef.current);

        // Fit bounds to show entire route
        mapRef.current.fitBounds(polyline.getBounds(), {
            padding: [50, 50],
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [latlng, activityType]);

    if (!latlng || latlng.length === 0) {
        return (
            <div className="glass rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-600">No GPS data available for this activity</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-6 animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-3xl">🗺️</span>
                Route Map
            </h3>
            <div
                ref={containerRef}
                className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg"
                style={{ zIndex: 1 }}
            />
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                    <span>Start</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                    <span>Finish</span>
                </div>
            </div>
        </div>
    );
}

function getRouteColor(activityType: string): string {
    const colors: Record<string, string> = {
        Run: "#f97316",
        Walk: "#10b981",
        Hike: "#f59e0b",
        Ride: "#3b82f6",
        VirtualRide: "#6366f1",
        EBikeRide: "#8b5cf6",
        Swim: "#06b6d4",
    };
    return colors[activityType] || "#6b7280";
}
