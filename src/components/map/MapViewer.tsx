import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapService from '../../services/mapService';
import { MapPin, TimePeriod, Coordinates, DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from '../../types/map';

// Fix Leaflet default marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewerProps {
    pins?: MapPin[];
    currentTimePeriod?: TimePeriod;
    transparency?: number; // 0-100
    onPinClick?: (pin: MapPin) => void;
    onMapClick?: (coords: Coordinates) => void;
    centerOn?: Coordinates;
    zoom?: number;
}

/**
 * Component to handle dynamic map updates without re-mounting
 */
const MapUpdater: React.FC<{
    center?: Coordinates;
    zoom?: number;
    timePeriod?: TimePeriod;
    transparency: number;
}> = ({ center, zoom, timePeriod, transparency }) => {
    const map = useMap();

    useEffect(() => {
        if (center && zoom) {
            map.setView([center.latitude, center.longitude], zoom);
        }
    }, [center, zoom, map]);

    useEffect(() => {
        // Update tile layer opacity based on transparency setting
        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                layer.setOpacity(transparency / 100);
            }
        });
    }, [transparency, map]);

    return null;
};

const MapViewer: React.FC<MapViewerProps> = ({
    pins = [],
    currentTimePeriod,
    transparency = 100,
    onPinClick,
    onMapClick,
    centerOn,
    zoom
}) => {
    const [mapCenter, setMapCenter] = useState<Coordinates>(
        centerOn || currentTimePeriod?.defaultCenter || DEFAULT_MAP_CENTER
    );
    const [mapZoom, setMapZoom] = useState<number>(
        zoom || currentTimePeriod?.defaultZoom || DEFAULT_ZOOM
    );
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Get tile URL from time period or fallback to OSM
    const tileUrl = currentTimePeriod 
        ? mapService.getTileUrl(currentTimePeriod.id)
        : mapService.getBaseLayerUrl();

    const attribution = currentTimePeriod?.tileLayer.attribution || 
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    // Update center when prop changes
    useEffect(() => {
        if (centerOn) {
            setMapCenter(centerOn);
        }
    }, [centerOn]);

    // Update zoom when prop changes
    useEffect(() => {
        if (zoom !== undefined) {
            setMapZoom(zoom);
        }
    }, [zoom]);

    // Handle map creation
    const handleMapCreated = (map: L.Map) => {
        mapRef.current = map;

        // Add click handler for map
        if (onMapClick) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                onMapClick({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                });
            });
        }
    };

    // Update markers when pins change
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        pins.forEach(pin => {
            const marker = L.marker([pin.coordinates.latitude, pin.coordinates.longitude])
                .bindPopup(`
                    <div style="min-width: 150px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
                            ${pin.locationName}
                        </h4>
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                            ${pin.verseReference}
                        </p>
                        ${pin.description ? `<p style="margin: 4px 0 0 0; font-size: 11px;">${pin.description}</p>` : ''}
                    </div>
                `)
                .addTo(mapRef.current!);

            if (onPinClick) {
                marker.on('click', () => onPinClick(pin));
            }

            markersRef.current.push(marker);
        });

        return () => {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
        };
    }, [pins, onPinClick]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <MapContainer
                center={[mapCenter.latitude, mapCenter.longitude]}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                ref={handleMapCreated as any}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url={tileUrl}
                    attribution={attribution}
                    opacity={transparency / 100}
                    maxZoom={currentTimePeriod?.tileLayer.maxZoom || 18}
                    minZoom={currentTimePeriod?.tileLayer.minZoom || 1}
                />
                
                <MapUpdater
                    center={centerOn}
                    zoom={zoom}
                    timePeriod={currentTimePeriod}
                    transparency={transparency}
                />
            </MapContainer>
        </div>
    );
};

export default MapViewer;