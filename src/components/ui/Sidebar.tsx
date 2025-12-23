import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Additional Information</h2>
            <div className="controls">
                <button>Show Map Layers</button>
                <button>View Journey Timeline</button>
                <button>Search Locations</button>
            </div>
            <div className="info-section">
                <h3>Contextual Information</h3>
                <p>Select a location on the map to see more details here.</p>
            </div>
        </div>
    );
};

export default Sidebar;