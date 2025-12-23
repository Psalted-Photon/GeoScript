import React from 'react';

const StoryNavigator: React.FC = () => {
    const [currentStoryIndex, setCurrentStoryIndex] = React.useState(0);
    const stories = []; // This should be populated with story data

    const handleNextStory = () => {
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
        }
    };

    const handlePreviousStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        }
    };

    return (
        <div className="story-navigator">
            <h2>{stories[currentStoryIndex]?.title}</h2>
            <p>{stories[currentStoryIndex]?.content}</p>
            <div className="navigation-controls">
                <button onClick={handlePreviousStory} disabled={currentStoryIndex === 0}>
                    Previous
                </button>
                <button onClick={handleNextStory} disabled={currentStoryIndex === stories.length - 1}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default StoryNavigator;