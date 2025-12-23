import React, { useEffect, useState } from 'react';
import { Journey } from '../../types/journey';
import { useJourneyAnimation } from '../../hooks/useJourneyAnimation';
import { journeyService } from '../../services/journeyService';

const JourneyPlayer: React.FC<{ journeyId: string }> = ({ journeyId }) => {
    const [journey, setJourney] = useState<Journey | null>(null);
    const { playJourney, pauseJourney, stopJourney, isPlaying } = useJourneyAnimation();

    useEffect(() => {
        const fetchJourney = async () => {
            const fetchedJourney = await journeyService.getJourneyById(journeyId);
            setJourney(fetchedJourney);
        };

        fetchJourney();
    }, [journeyId]);

    const handlePlay = () => {
        if (journey) {
            playJourney(journey);
        }
    };

    const handlePause = () => {
        pauseJourney();
    };

    const handleStop = () => {
        stopJourney();
    };

    if (!journey) {
        return <div>Loading journey...</div>;
    }

    return (
        <div>
            <h2>{journey.title}</h2>
            <div>
                <button onClick={handlePlay} disabled={isPlaying}>Play</button>
                <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
                <button onClick={handleStop}>Stop</button>
            </div>
            <div>
                {/* Render journey steps or related content here */}
            </div>
        </div>
    );
};

export default JourneyPlayer;