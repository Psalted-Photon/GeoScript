import React from 'react';
import { Journey } from '../../types/journey';
import './JourneyTimeline.css';

interface JourneyTimelineProps {
    journeys: Journey[];
    onSelectJourney: (journeyId: string) => void;
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ journeys, onSelectJourney }) => {
    return (
        <div className="journey-timeline">
            <h2>Journey Timeline</h2>
            <ul>
                {journeys.map(journey => (
                    <li key={journey.id} onClick={() => onSelectJourney(journey.id)}>
                        <span className="journey-title">{journey.title}</span>
                        <span className="journey-date">{journey.date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JourneyTimeline;