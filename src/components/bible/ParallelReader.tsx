import React from 'react';
import { useVerseLinks } from '../../hooks/useVerseLinks';
import { useMapSync } from '../../hooks/useMapSync';

const ParallelReader: React.FC = () => {
    const { linkedVerses, selectVerse } = useVerseLinks();
    const { syncMapWithVerse } = useMapSync();

    const handleVerseClick = (verse: string) => {
        selectVerse(verse);
        syncMapWithVerse(verse);
    };

    return (
        <div className="parallel-reader">
            <div className="bible-text">
                {linkedVerses.map((verse, index) => (
                    <div key={index} onClick={() => handleVerseClick(verse)}>
                        {verse}
                    </div>
                ))}
            </div>
            <div className="map-view">
                {/* Map component will be integrated here */}
            </div>
        </div>
    );
};

export default ParallelReader;