import React from 'react';
import TimeLayerSelector from './TimeLayerSelector';
import TransparencySlider from './TransparencySlider';
import { TimePeriod } from '../../types/map';

interface MapControlsProps {
    currentTimePeriod?: TimePeriod;
    transparency: number;
    onTimePeriodChange: (period: TimePeriod) => void;
    onTransparencyChange: (value: number) => void;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const MapControls: React.FC<MapControlsProps> = ({
    currentTimePeriod,
    transparency,
    onTimePeriodChange,
    onTransparencyChange,
    position = 'top-right'
}) => {
    const getPositionStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            position: 'absolute',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '12px'
        };

        switch (position) {
            case 'top-left':
                return { ...baseStyles, top: 0, left: 0 };
            case 'top-right':
                return { ...baseStyles, top: 0, right: 0 };
            case 'bottom-left':
                return { ...baseStyles, bottom: 0, left: 0 };
            case 'bottom-right':
                return { ...baseStyles, bottom: 0, right: 0 };
            default:
                return { ...baseStyles, top: 0, right: 0 };
        }
    };

    return (
        <div style={getPositionStyles()}>
            <TimeLayerSelector
                currentTimePeriod={currentTimePeriod}
                onTimePeriodChange={onTimePeriodChange}
            />
            
            <TransparencySlider
                value={transparency}
                onChange={onTransparencyChange}
            />
        </div>
    );
};

export default MapControls;