import React, { useState } from 'react';

const TerrainToggle: React.FC = () => {
    const [is3D, setIs3D] = useState(false);

    const toggleTerrain = () => {
        setIs3D(prevState => !prevState);
        // Additional logic to switch between 2D and 3D views can be added here
    };

    return (
        <div className="terrain-toggle">
            <button onClick={toggleTerrain}>
                {is3D ? 'Switch to 2D' : 'Switch to 3D'}
            </button>
        </div>
    );
};

export default TerrainToggle;