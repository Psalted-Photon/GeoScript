import React, { useState, useEffect } from 'react';
import mapService from '../../services/mapService';
import { TimePeriod } from '../../types/map';

interface TimeLayerSelectorProps {
    currentTimePeriod?: TimePeriod;
    onTimePeriodChange: (timePeriod: TimePeriod) => void;
    style?: React.CSSProperties;
}

const TimeLayerSelector: React.FC<TimeLayerSelectorProps> = ({ 
    currentTimePeriod, 
    onTimePeriodChange,
    style
}) => {
    const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
        currentTimePeriod?.id || ''
    );

    useEffect(() => {
        const periods = mapService.getTimePeriods();
        setTimePeriods(periods);
        
        // Set default if not provided
        if (!currentTimePeriod && periods.length > 0) {
            const defaultPeriod = mapService.getDefaultTimePeriod();
            setSelectedPeriodId(defaultPeriod.id);
            onTimePeriodChange(defaultPeriod);
        }
    }, []);

    useEffect(() => {
        if (currentTimePeriod) {
            setSelectedPeriodId(currentTimePeriod.id);
        }
    }, [currentTimePeriod]);

    const handleLayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const periodId = event.target.value;
        const period = mapService.getTimePeriodById(periodId);
        
        if (period) {
            setSelectedPeriodId(periodId);
            onTimePeriodChange(period);
        }
    };

    const containerStyle: React.CSSProperties = {
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '250px',
        ...style
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#333'
    };

    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        fontSize: '13px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: 'white',
        cursor: 'pointer',
        outline: 'none'
    };

    const descriptionStyle: React.CSSProperties = {
        marginTop: '8px',
        fontSize: '11px',
        color: '#666',
        lineHeight: '1.4'
    };

    const selectedPeriod = timePeriods.find(p => p.id === selectedPeriodId);

    return (
        <div style={containerStyle}>
            <label htmlFor="time-period-selector" style={labelStyle}>
                Historical Time Period
            </label>
            <select 
                id="time-period-selector" 
                value={selectedPeriodId} 
                onChange={handleLayerChange}
                style={selectStyle}
            >
                <option value="">-- Select Era --</option>
                {timePeriods.map((period) => (
                    <option key={period.id} value={period.id}>
                        {period.displayName} ({period.dateRange})
                    </option>
                ))}
            </select>
            
            {selectedPeriod && (
                <div style={descriptionStyle}>
                    {selectedPeriod.description}
                </div>
            )}
        </div>
    );
};

export default TimeLayerSelector;