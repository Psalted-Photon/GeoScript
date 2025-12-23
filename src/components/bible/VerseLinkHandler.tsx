import React, { useEffect } from 'react';
import { BibleReference } from '../../types/bible';
import { MapPin } from '../../types/map';
import { VerseLink } from '../../types/bible';

interface VerseLinkHandlerProps {
    mapPins: MapPin[];
    selectedReference?: BibleReference;
    onPinSelect?: (pin: MapPin) => void;
    onReferenceSelect?: (ref: BibleReference) => void;
}

/**
 * VerseLinkHandler manages the connection between Bible verses and map locations
 * Handles bidirectional linking: verse -> location and location -> verse
 */
const VerseLinkHandler: React.FC<VerseLinkHandlerProps> = ({
    mapPins,
    selectedReference,
    onPinSelect,
    onReferenceSelect
}) => {
    /**
     * When a reference is selected, find and highlight the corresponding map pin
     */
    useEffect(() => {
        if (!selectedReference || !onPinSelect) return;

        // Find pin that matches the selected reference
        const matchingPin = mapPins.find(pin => {
            // Parse the pin's verse reference to match against selected reference
            const match = pin.verseReference.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)/);
            if (!match) return false;

            const [, book, chapter, verse] = match;
            return (
                book.trim() === selectedReference.book &&
                parseInt(chapter) === selectedReference.chapter &&
                parseInt(verse) === selectedReference.verse
            );
        });

        if (matchingPin) {
            onPinSelect(matchingPin);
        }
    }, [selectedReference, mapPins, onPinSelect]);

    /**
     * Helper function to create a BibleReference from a verse string
     */
    const parseVerseReference = (verseRef: string): BibleReference | null => {
        const match = verseRef.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) return null;

        const [, book, chapter, verse, endVerse] = match;
        
        // Simple book number lookup (would need full implementation)
        const bookNumber = 1; // Placeholder

        return {
            book: book.trim(),
            bookNumber,
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            endVerse: endVerse ? parseInt(endVerse) : undefined
        };
    };

    /**
     * Handle pin click - notify parent to load verse text
     */
    const handlePinClick = (pin: MapPin) => {
        if (!onReferenceSelect) return;

        const reference = parseVerseReference(pin.verseReference);
        if (reference) {
            onReferenceSelect(reference);
        }
    };

    /**
     * Get verse links for all map pins
     */
    const getVerseLinks = (): VerseLink[] => {
        const links: VerseLink[] = [];
        
        for (const pin of mapPins) {
            const reference = parseVerseReference(pin.verseReference);
            if (reference) {
                const link: VerseLink = {
                    reference,
                    locationId: pin.id,
                    locationType: 'primary' as 'primary' | 'mentioned' | 'route'
                };
                links.push(link);
            }
        }
        
        return links;
    };

    // This component doesn't render anything - it's just a handler
    // Actual rendering is done by MapViewer and VerseReader components
    return null;
};

export default VerseLinkHandler;