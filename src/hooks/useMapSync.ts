import { useEffect, useState } from 'react';
import { useVerseLinks } from '../hooks/useVerseLinks';
import { useJourneyAnimation } from '../hooks/useJourneyAnimation';

const useMapSync = (currentVerse: string, mapRef: React.RefObject<any>) => {
    const [mapPosition, setMapPosition] = useState({ lat: 0, lng: 0 });
    const { getVerseLocation } = useVerseLinks();
    const { isAnimating, startAnimation, stopAnimation } = useJourneyAnimation();

    useEffect(() => {
        const location = getVerseLocation(currentVerse);
        if (location) {
            setMapPosition(location);
            if (mapRef.current) {
                mapRef.current.panTo(location);
            }
        }
    }, [currentVerse, mapRef, getVerseLocation]);

    const syncMapWithJourney = (journey: any) => {
        if (isAnimating) {
            stopAnimation();
        }
        startAnimation(journey);
    };

    return { mapPosition, syncMapWithJourney };
};

export default useMapSync;