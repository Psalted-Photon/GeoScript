import React from 'react';

const AnimationControls: React.FC<{ onStart: () => void; onPause: () => void; onStop: () => void; isPlaying: boolean }> = ({ onStart, onPause, onStop, isPlaying }) => {
    return (
        <div className="animation-controls">
            <button onClick={isPlaying ? onPause : onStart}>
                {isPlaying ? 'Pause' : 'Start'}
            </button>
            <button onClick={onStop}>Stop</button>
        </div>
    );
};

export default AnimationControls;