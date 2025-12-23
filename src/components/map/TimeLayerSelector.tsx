import React, { useState, useEffect } from 'react';

const TimeLayerSelector = ({ onLayerChange }) => {
    const [timePeriods, setTimePeriods] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);

    useEffect(() => {
        const fetchTimePeriods = async () => {
            const response = await fetch('/data/timePeriods.json');
            const data = await response.json();
            setTimePeriods(data);
        };

        fetchTimePeriods();
    }, []);

    const handleLayerChange = (event) => {
        const layer = event.target.value;
        setSelectedLayer(layer);
        onLayerChange(layer);
    };

    return (
        <div className="time-layer-selector">
            <label htmlFor="time-layers">Select Time Period:</label>
            <select id="time-layers" value={selectedLayer} onChange={handleLayerChange}>
                <option value="">--Select a Time Period--</option>
                {timePeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                        {period.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TimeLayerSelector;