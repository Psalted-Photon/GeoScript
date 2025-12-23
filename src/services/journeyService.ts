import { Journey } from '../types/journey';
import journeysData from '../data/journeys.json';

class JourneyService {
    private journeys: Journey[];

    constructor() {
        this.journeys = journeysData;
    }

    getAllJourneys(): Journey[] {
        return this.journeys;
    }

    getJourneyById(id: string): Journey | undefined {
        return this.journeys.find(journey => journey.id === id);
    }

    getJourneysByLocation(locationId: string): Journey[] {
        return this.journeys.filter(journey => journey.locations.includes(locationId));
    }

    getJourneyPaths(id: string): Array<{ lat: number; lng: number }> | undefined {
        const journey = this.getJourneyById(id);
        return journey ? journey.path : undefined;
    }
}

export default new JourneyService();