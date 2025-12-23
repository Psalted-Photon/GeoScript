export interface Location {
    id: string;
    name: string;
    description?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    relatedVerses?: string[];
    historicalSignificance?: string;
    timePeriod?: string;
}