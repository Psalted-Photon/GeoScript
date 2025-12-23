export interface Journey {
    id: string;
    title: string;
    description: string;
    path: JourneyPoint[];
    relatedVerses: string[];
}

export interface JourneyPoint {
    latitude: number;
    longitude: number;
    verse: string;
    timestamp: Date;
}