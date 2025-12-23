export interface MapPin {
    id: string;
    verseReference: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    description?: string;
    historicalContext?: string;
}

export interface MapLayer {
    id: string;
    name: string;
    timePeriod: string;
    isVisible: boolean;
}

export interface MapSettings {
    transparency: number;
    currentLayer: string;
    is3DTerrain: boolean;
}

export interface Journey {
    id: string;
    name: string;
    path: Array<{ latitude: number; longitude: number }>;
    relatedVerses: string[];
}

export interface LocationSearchResult {
    id: string;
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    verseReferences: string[];
}