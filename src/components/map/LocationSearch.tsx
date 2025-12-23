import React, { useState } from 'react';

const LocationSearch: React.FC<{ onLocationSelect: (location: string) => void }> = ({ onLocationSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        // Fetch suggestions based on the search term
        if (value) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
        }
    };

    const fetchSuggestions = async (term: string) => {
        // Placeholder for fetching location suggestions
        // This should call a service to get location data
        const response = await fetch(`/api/locations?query=${term}`);
        const data = await response.json();
        setSuggestions(data.locations);
    };

    const handleSuggestionClick = (location: string) => {
        onLocationSelect(location);
        setSearchTerm(location);
        setSuggestions([]);
    };

    return (
        <div className="location-search">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for a location..."
            />
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((location, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(location)}>
                            {location}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationSearch;