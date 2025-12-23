import React, { useState } from 'react';

const TransparencySlider: React.FC<{ onChange: (value: number) => void }> = ({ onChange }) => {
    const [transparency, setTransparency] = useState(100);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        setTransparency(value);
        onChange(value);
    };

    return (
        <div className="transparency-slider">
            <label htmlFor="transparency">Map Transparency: {transparency}%</label>
            <input
                type="range"
                id="transparency"
                min="0"
                max="100"
                value={transparency}
                onChange={handleSliderChange}
            />
        </div>
    );
};

export default TransparencySlider;