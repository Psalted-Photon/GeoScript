import React from 'react';
import { useVerseLinks } from '../../hooks/useVerseLinks';
import { MapPin } from '../ui/MapPin';

const VerseLinkHandler: React.FC = () => {
    const { verseLinks } = useVerseLinks();

    return (
        <div>
            {verseLinks.map((link) => (
                <MapPin key={link.id} location={link.location} verse={link.verse} />
            ))}
        </div>
    );
};

export default VerseLinkHandler;