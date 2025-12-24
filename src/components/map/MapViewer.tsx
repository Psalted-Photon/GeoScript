import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapService from '../../services/mapService';
import { MapPin, TimePeriod, Coordinates, DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from '../../types/map';

// Fix Leaflet default marker icon issue in React
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
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
    selectedPinId?: string;
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
    zoom,
    selectedPinId
}) => {
    const [mapCenter, setMapCenter] = useState<Coordinates>(
        centerOn || currentTimePeriod?.defaultCenter || DEFAULT_MAP_CENTER
    );
    const [mapZoom, setMapZoom] = useState<number>(
        zoom || currentTimePeriod?.defaultZoom || DEFAULT_ZOOM
    );
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Use base layer (Carto CDN) for now - historical tiles will be added later
    const tileUrl = mapService.getBaseLayerUrl();

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

        // Clear existing markers (for cleanup)
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        return () => {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
        };
    }, [pins, onPinClick, selectedPinId]);

    // Create custom icon for a pin
    const createCustomIcon = (pin: MapPin, isSelected: boolean) => {
        const hasMultipleVerses = pin.relatedVerses && pin.relatedVerses.length > 1;
        const isPurple = hasMultipleVerses;
        const baseColor = isPurple ? '#800080' : (currentTimePeriod?.iconColor || '#3388ff');
        const strokeColor = isSelected ? '#00ff00' : '#ffffff';
        const strokeWidth = isSelected ? '3' : '2';
        
        let iconHtml = '';
        const type = pin.locationType || 'settlement';
        
        // Different icon shapes based on location type
        switch (type) {
            case 'region':
                // Large hexagon for regions/countries
                iconHtml = `
                    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="15,2 27,8 27,22 15,28 3,22 3,8" 
                                 fill="${baseColor}" 
                                 stroke="${strokeColor}" 
                                 stroke-width="${strokeWidth}" 
                                 fill-opacity="0.7"/>
                        <circle cx="15" cy="15" r="5" fill="white"/>
                    </svg>
                `;
                return L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-marker region-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    popupAnchor: [0, -15]
                });
                
            case 'mountain':
                // Triangle for mountains
                iconHtml = `
                    <svg width="28" height="35" viewBox="0 0 28 35" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3 L27 32 L1 32 Z" 
                              fill="${baseColor}" 
                              stroke="${strokeColor}" 
                              stroke-width="${strokeWidth}"/>
                        <circle cx="14" cy="22" r="4" fill="white"/>
                    </svg>
                `;
                return L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-marker mountain-marker',
                    iconSize: [28, 35],
                    iconAnchor: [14, 35],
                    popupAnchor: [0, -25]
                });
                
            case 'water':
                // Wavy circle for rivers/bodies of water
                iconHtml = `
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" 
                                fill="${baseColor}" 
                                stroke="${strokeColor}" 
                                stroke-width="${strokeWidth}"/>
                        <path d="M6 12 Q 8 10, 10 12 T 14 12 Q 16 14, 18 12" 
                              stroke="white" 
                              stroke-width="2" 
                              fill="none"/>
                    </svg>
                `;
                return L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-marker water-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, -12]
                });
                
            case 'structure':
                // Square for structures/buildings
                iconHtml = `
                    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="18" height="18" 
                              fill="${baseColor}" 
                              stroke="${strokeColor}" 
                              stroke-width="${strokeWidth}"/>
                        <circle cx="11" cy="11" r="4" fill="white"/>
                    </svg>
                `;
                return L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-marker structure-marker',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                    popupAnchor: [0, -11]
                });
                
            case 'area':
                // Diamond for natural areas
                iconHtml = `
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="2" width="15" height="15" 
                              transform="rotate(45 12 12)" 
                              fill="${baseColor}" 
                              stroke="${strokeColor}" 
                              stroke-width="${strokeWidth}"/>
                        <circle cx="12" cy="12" r="4" fill="white"/>
                    </svg>
                `;
                return L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-marker area-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, -12]
                });
                
            case 'settlement':
            default:
                // Standard pin for settlements/cities
                iconHtml = `
                    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5s12.5-19.1 12.5-28.5C25 5.6 19.4 0 12.5 0z" 
                              fill="${baseColor}" 
                              stroke="${strokeColor}" 
                              stroke-width="${strokeWidth}"/>
                        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
                    </svg>
                `;
                return L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-marker settlement-marker',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                });
        }
    };

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

                {/* Clustered Markers */}
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                >
                    {pins.map((pin) => {
                        const isSelected = selectedPinId === pin.id;
                        const icon = createCustomIcon(pin, isSelected);
                        
                        return (
                            <Marker
                                key={pin.id}
                                position={[pin.coordinates.latitude, pin.coordinates.longitude]}
                                icon={icon}
                                eventHandlers={{
                                    click: () => {
                                        if (onPinClick) {
                                            onPinClick(pin);
                                        }
                                    }
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                                            {pin.locationName}
                                        </h4>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                                            {pin.relatedVerses && pin.relatedVerses.length > 1 ? (
                                                <>
                                                    <strong style={{ color: '#800080' }}>
                                                        {pin.relatedVerses.length} References:
                                                    </strong>
                                                    <br />
                                                    {pin.relatedVerses.map((verseRef, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (onPinClick) {
                                                                        onPinClick({ ...pin, verseReference: verseRef });
                                                                    }
                                                                }}
                                                                style={{
                                                                    color: '#3b82f6',
                                                                    textDecoration: 'underline',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {verseRef}
                                                            </a>
                                                            {idx < pin.relatedVerses!.length - 1 && <br />}
                                                        </React.Fragment>
                                                    ))}
                                                </>
                                            ) : (
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                        if (onPinClick) {
                                                            onPinClick(pin);
                                                        }
                                                    }}
                                                    style={{
                                                        color: '#3b82f6',
                                                        textDecoration: 'underline',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {pin.verseReference}
                                                </a>
                                            )}
                                        </p>
                                        {pin.description && (
                                            <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
                                                {pin.description}
                                            </p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default MapViewer;