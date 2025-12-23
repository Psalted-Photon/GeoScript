import { useState, useEffect } from 'react';

const useJourneyAnimation = (journeyData) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [animationInterval, setAnimationInterval] = useState(null);

    const startAnimation = () => {
        if (journeyData.length === 0) return;

        setIsAnimating(true);
        setCurrentStep(0);
    };

    const stopAnimation = () => {
        setIsAnimating(false);
        if (animationInterval) {
            clearInterval(animationInterval);
            setAnimationInterval(null);
        }
    };

    useEffect(() => {
        if (isAnimating) {
            const interval = setInterval(() => {
                setCurrentStep((prevStep) => {
                    if (prevStep < journeyData.length - 1) {
                        return prevStep + 1;
                    } else {
                        stopAnimation();
                        return prevStep;
                    }
                });
            }, 1000); // Adjust the timing as needed

            setAnimationInterval(interval);
        }

        return () => {
            if (animationInterval) {
                clearInterval(animationInterval);
            }
        };
    }, [isAnimating, journeyData, animationInterval]);

    return {
        isAnimating,
        currentStep,
        startAnimation,
        stopAnimation,
    };
};

export default useJourneyAnimation;