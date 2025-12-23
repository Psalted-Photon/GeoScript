import { TimePeriod, Coordinates, MapBounds, BIBLICAL_REGION_BOUNDS } from '../types/map';
import timePeriodsData from '../data/timePeriods.json';

/**
 * MapService handles map configuration, tile layer management,
 * and coordinate utilities for the Leaflet-based map system
 */
class MapService {
    private timePeriods: TimePeriod[];

    constructor() {
        this.timePeriods = (timePeriodsData as any).timePeriods as TimePeriod[];
    }

    /**
     * Get all available time periods
     */
    public getTimePeriods(): TimePeriod[] {
        return this.timePeriods;
    }

    /**
     * Get a specific time period by ID
     */
    public getTimePeriodById(id: string): TimePeriod | undefined {
        return this.timePeriods.find(period => period.id === id);
    }

    /**
     * Get the default time period (Jesus' Ministry)
     */
    public getDefaultTimePeriod(): TimePeriod {
        return this.getTimePeriodById('jesus-ministry') || this.timePeriods[0];
    }

    /**
     * Generate tile URL for a given time period
     * Falls back to OSM if historical tiles not available
     */
    public getTileUrl(timePeriodId: string): string {
        const period = this.getTimePeriodById(timePeriodId);
        if (period) {
            return period.tileLayer.url;
        }
        // Fallback to OpenStreetMap
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    /**
     * Get OpenStreetMap base layer URL
     */
    public getBaseLayerUrl(): string {
        // Using Carto's CDN basemap - more reliable than direct OSM
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }

    /**
     * Calculate distance between two coordinates (in km)
     * Using Haversine formula
     */
    public calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(coord2.latitude - coord1.latitude);
        const dLon = this.toRadians(coord2.longitude - coord1.longitude);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(coord1.latitude)) * 
                  Math.cos(this.toRadians(coord2.latitude)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Check if coordinates are within biblical region bounds
     */
    public isInBiblicalRegion(coords: Coordinates): boolean {
        const bounds = BIBLICAL_REGION_BOUNDS;
        return coords.latitude >= bounds.south &&
               coords.latitude <= bounds.north &&
               coords.longitude >= bounds.west &&
               coords.longitude <= bounds.east;
    }

    /**
     * Get appropriate zoom level based on journey span
     */
    public calculateZoomForBounds(bounds: MapBounds): number {
        const latDiff = bounds.north - bounds.south;
        const lonDiff = bounds.east - bounds.west;
        const maxDiff = Math.max(latDiff, lonDiff);
        
        if (maxDiff > 20) return 4;
        if (maxDiff > 10) return 5;
        if (maxDiff > 5) return 6;
        if (maxDiff > 2) return 7;
        if (maxDiff > 1) return 8;
        return 9;
    }

    /**
     * Get bounds that encompass an array of coordinates
     */
    public getBoundsForCoordinates(coords: Coordinates[]): MapBounds {
        if (coords.length === 0) {
            return BIBLICAL_REGION_BOUNDS;
        }

        const lats = coords.map(c => c.latitude);
        const lons = coords.map(c => c.longitude);

        return {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lons),
            west: Math.min(...lons)
        };
    }

    /**
     * Format coordinates for display
     */
    public formatCoordinates(coords: Coordinates): string {
        const lat = coords.latitude >= 0 ? 
            `${coords.latitude.toFixed(4)}°N` : 
            `${Math.abs(coords.latitude).toFixed(4)}°S`;
        const lon = coords.longitude >= 0 ? 
            `${coords.longitude.toFixed(4)}°E` : 
            `${Math.abs(coords.longitude).toFixed(4)}°W`;
        return `${lat}, ${lon}`;
    }

    /**
     * Convert degrees to radians
     */
    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

export default new MapService();