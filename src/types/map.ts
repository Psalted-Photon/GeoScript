// Core map types for Leaflet integration

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface MapPin {
    id: string;
    verseReference: string;
    coordinates: Coordinates;
    locationName: string;
    description?: string;
    historicalContext?: string;
    timePeriodId?: string;
}

// Historical map layer configuration
export interface TileLayer {
    id: string;
    name: string;
    url: string; // URL template for tile pyramid: /tiles/{period}/{z}/{x}/{y}.png
    attribution: string;
    minZoom: number;
    maxZoom: number;
    bounds?: MapBounds; // Optional geographic bounds for the layer
}

export interface TimePeriod {
    id: string;
    name: string;
    displayName: string;
    dateRange: string; // e.g., "2000-1500 BC"
    description: string;
    tileLayer: TileLayer;
    defaultCenter: Coordinates;
    defaultZoom: number;
    iconColor?: string; // For UI timeline color coding
}

export interface MapLayer {
    id: string;
    name: string;
    timePeriod: string;
    isVisible: boolean;
    opacity: number;
}

export interface MapSettings {
    transparency: number; // 0-100, controls overlay opacity
    currentTimePeriodId: string;
    is3DTerrain: boolean;
    showPins: boolean;
    baseLayerType: 'osm' | 'satellite' | 'terrain' | 'none';
}

export interface Journey {
    id: string;
    name: string;
    path: Array<{ latitude: number; longitude: number }>;
    relatedVerses: string[];
    timePeriodId: string;
}

export interface LocationSearchResult {
    id: string;
    name: string;
    coordinates: Coordinates;
    verseReferences: string[];
    timePeriods: string[]; // Which eras this location is relevant to
}

// Biblical region bounds (approximate)
export const BIBLICAL_REGION_BOUNDS: MapBounds = {
    north: 37.5, // Southern Turkey
    south: 29.0, // Northern Egypt/Sinai
    east: 42.0,  // Mesopotamia
    west: 31.0   // Mediterranean
};

export const DEFAULT_MAP_CENTER: Coordinates = {
    latitude: 31.7683, // Jerusalem
    longitude: 35.2137
};

export const DEFAULT_ZOOM = 7;