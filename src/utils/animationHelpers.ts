// This file contains helper functions for managing animations in the Bible and map application.

export const animateJourney = (journeyPath: Array<{ lat: number; lng: number }>, duration: number, callback: () => void) => {
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;

        const progress = Math.min(elapsed / duration, 1);
        const currentPointIndex = Math.floor(progress * (journeyPath.length - 1));
        const nextPointIndex = Math.min(currentPointIndex + 1, journeyPath.length - 1);

        const currentPoint = journeyPath[currentPointIndex];
        const nextPoint = journeyPath[nextPointIndex];

        // Logic to update the map with the current point
        // e.g., updateMapPosition(currentPoint);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    };

    requestAnimationFrame(animate);
};

export const fadeIn = (element: HTMLElement, duration: number) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '1';
};

export const fadeOut = (element: HTMLElement, duration: number, callback: () => void) => {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';

    setTimeout(() => {
        callback();
    }, duration);
};