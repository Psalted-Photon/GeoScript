import React from 'react';

interface MapPinProps {
    verse: string;
    coordinates: { lat: number; lng: number };
    onClick: () => void;
}

const MapPin: React.FC<MapPinProps> = ({ verse, coordinates, onClick }) => {
    return (
        <div 
            className="map-pin" 
            style={{ position: 'absolute', left: `${coordinates.lng}px`, top: `${coordinates.lat}px` }} 
            onClick={onClick}
        >
            <span>{verse}</span>
        </div>
    );
};

export default MapPin;