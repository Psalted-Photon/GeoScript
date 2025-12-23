import React, { useState, useEffect } from 'react';

interface TransparencySliderProps {
    value?: number; // 0-100
    onChange: (value: number) => void;
    style?: React.CSSProperties;
    showLabel?: boolean;
}

const TransparencySlider: React.FC<TransparencySliderProps> = ({ 
    value = 100,
    onChange,
    style,
    showLabel = true
}) => {
    const [transparency, setTransparency] = useState(value);

    useEffect(() => {
        setTransparency(value);
    }, [value]);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value);
        setTransparency(newValue);
        onChange(newValue);
    };

    const containerStyle: React.CSSProperties = {
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '200px',
        ...style
    };

    const labelStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#333'
    };

    const sliderStyle: React.CSSProperties = {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        outline: 'none',
        WebkitAppearance: 'none',
        background: `linear-gradient(to right, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.8) ${transparency}%, #e5e7eb ${transparency}%, #e5e7eb 100%)`,
        cursor: 'pointer'
    };

    const valueDisplayStyle: React.CSSProperties = {
        fontSize: '12px',
        fontWeight: '700',
        color: '#3b82f6',
        backgroundColor: '#eff6ff',
        padding: '2px 8px',
        borderRadius: '4px'
    };

    const descriptionStyle: React.CSSProperties = {
        marginTop: '6px',
        fontSize: '10px',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between'
    };

    return (
        <div style={containerStyle}>
            {showLabel && (
                <div style={labelStyle}>
                    <span>Map Opacity</span>
                    <span style={valueDisplayStyle}>{transparency}%</span>
                </div>
            )}
            <input
                type="range"
                id="transparency-slider"
                min="0"
                max="100"
                value={transparency}
                onChange={handleSliderChange}
                style={sliderStyle}
            />
            <div style={descriptionStyle}>
                <span>Transparent</span>
                <span>Opaque</span>
            </div>
        </div>
    );
};

export default TransparencySlider;