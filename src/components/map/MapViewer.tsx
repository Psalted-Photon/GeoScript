import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchLocations } from '../../services/mapService';
import { useVerseLinks } from '../../hooks/useVerseLinks';
import { Location } from '../../types/location';

const MapViewer: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const { linkedVerses } = useVerseLinks();

    useEffect(() => {
        const loadLocations = async () => {
            const data = await fetchLocations();
            setLocations(data);
        };
        loadLocations();
    }, []);

    return (
        <MapContainer center={[31.0461, 34.8516]} zoom={5} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map(location => (
                <Marker key={location.id} position={[location.latitude, location.longitude]}>
                    <Popup>
                        <strong>{location.name}</strong><br />
                        {linkedVerses[location.id]?.map(verse => (
                            <div key={verse}>{verse}</div>
                        ))}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapViewer;