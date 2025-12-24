import { TimePeriodId } from './map';

export interface Location {
    id: number;
    name: string;
    description?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    relatedVerses?: string[];
    historicalSignificance?: string;
    timePeriod?: TimePeriodId;
    locationType?: 'settlement' | 'region' | 'mountain' | 'water' | 'area' | 'structure';
    metadata?: {
        confidence?: number;
        verseCount?: number;
        sourceId?: string;
        types?: string[];
    };
}