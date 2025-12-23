import React from 'react';

interface ContextualPopupProps {
    isOpen: boolean;
    locationName: string;
    historicalNotes: string;
    archaeologicalNotes: string;
    onClose: () => void;
}

const ContextualPopup: React.FC<ContextualPopupProps> = ({ isOpen, locationName, historicalNotes, archaeologicalNotes, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="contextual-popup">
            <div className="popup-content">
                <h2>{locationName}</h2>
                <h3>Historical Notes</h3>
                <p>{historicalNotes}</p>
                <h3>Archaeological Notes</h3>
                <p>{archaeologicalNotes}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ContextualPopup;