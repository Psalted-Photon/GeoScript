import { Location } from '../types/location';
import { Verse } from '../types/bible';

export const getMapPinData = (verse: Verse, locations: Location[]) => {
    return locations.filter(location => location.verseIds.includes(verse.id));
};

export const calculateMapCenter = (locations: Location[]) => {
    const latitudes = locations.map(location => location.latitude);
    const longitudes = locations.map(location => location.longitude);
    
    const centerLatitude = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const centerLongitude = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    return { latitude: centerLatitude, longitude: centerLongitude };
};

export const getTimePeriodLayers = (timePeriods: any[], selectedPeriod: string) => {
    return timePeriods.find(period => period.name === selectedPeriod)?.layers || [];
};

export const formatLocationLabel = (location: Location) => {
    return `${location.name} (${location.type})`;
};