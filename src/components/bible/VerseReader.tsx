import React, { useState, useEffect, useRef } from 'react';
import bibleService from '../../services/bibleService';
import { BibleVerse, BibleReference, BibleVersionId, DEFAULT_VERSION } from '../../types/bible';
import BookSelector from './BookSelector';
import { findLocationsInText } from '../../utils/locationParser';

interface ChapterVerse {
    verse: number;
    text: string;
}

// Exported interface for VerseReader component props
export interface VerseReaderProps {
    reference?: BibleReference;
    version?: BibleVersionId;
    showInterlinear?: boolean;
    onVerseClick?: (ref: BibleReference) => void;
    onReferenceChange?: (ref: BibleReference) => void;
    onLocationClick?: (locationName: string) => void;
}

const VerseReader: React.FC<VerseReaderProps> = ({
    reference,
    version = DEFAULT_VERSION,
    showInterlinear = false,
    onVerseClick,
    onReferenceChange,
    onLocationClick
}) => {
    const [verses, setVerses] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showBookSelector, setShowBookSelector] = useState<boolean>(false);
    
    // Chapter expansion state
    const [expanded, setExpanded] = useState<boolean>(false);
    const [fullChapter, setFullChapter] = useState<ChapterVerse[]>([]);
    const [chapterLoading, setChapterLoading] = useState<boolean>(false);
    const [isNavigating, setIsNavigating] = useState<boolean>(false); // Track navigation
    const highlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!reference) return;

        const loadVerses = async () => {
            setLoading(true);
            setError(null);
            // Only reset expansion if we're not navigating chapters
            if (!isNavigating) {
                setExpanded(false);
            }
            setIsNavigating(false); // Reset navigation flag

            try {
                const fetchedVerses = await bibleService.fetchVerses(reference, version);
                setVerses(fetchedVerses);

                // Fetch interlinear data if requested
                if (showInterlinear && version === 'KJV') {
                    const interlinearWords = await bibleService.fetchInterlinear(reference);
                    // Attach interlinear data to first verse
                    if (fetchedVerses.length > 0 && interlinearWords.length > 0) {
                        fetchedVerses[0].interlinearWords = interlinearWords;
                        setVerses([...fetchedVerses]);
                    }
                }
            } catch (err) {
                setError('Failed to load Bible text. Please try again.');
                console.error('Error loading verses:', err);
            } finally {
                setLoading(false);
            }
        };

        loadVerses();
    }, [reference, version, showInterlinear]);

    const handleVerseClick = (verse: BibleVerse) => {
        if (onVerseClick) {
            onVerseClick(verse.reference);
        }
    };

    const handleExpandChapter = async () => {
        if (!reference) return;
        
        if (expanded) {
            setExpanded(false);
            return;
        }

        setChapterLoading(true);
        try {
            const chapter = await bibleService.fetchChapter(
                reference.bookNumber,
                reference.chapter,
                version
            );
            setFullChapter(chapter);
            setExpanded(true);
            
            // Scroll to highlighted verse after a short delay
            setTimeout(() => {
                if (highlightRef.current) {
                    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } catch (err) {
            console.error('Failed to load chapter:', err);
            setError('Failed to load full chapter');
        } finally {
            setChapterLoading(false);
        }
    };

    const handleNavigateChapter = async (direction: 'next' | 'prev') => {
        if (!reference) return;

        setChapterLoading(true);
        setIsNavigating(true); // Mark that we're navigating
        try {
            // Get the next or previous chapter
            const newChapter = direction === 'next'
                ? bibleService.getNextChapter(reference.bookNumber, reference.chapter)
                : bibleService.getPreviousChapter(reference.bookNumber, reference.chapter);

            // Get the book name for the new chapter
            const newBookName = bibleService.getBookName(newChapter.bookNumber);
            
            // Create a new reference for verse 1 of the new chapter
            const newReference: BibleReference = {
                book: newBookName,
                bookNumber: newChapter.bookNumber,
                chapter: newChapter.chapter,
                verse: 1
            };

            // Fetch the new chapter
            const chapter = await bibleService.fetchChapter(
                newChapter.bookNumber,
                newChapter.chapter,
                version
            );
            
            // Update the expanded chapter
            setFullChapter(chapter);
            setExpanded(true); // Keep expansion state
            
            // Update the parent reference
            if (onReferenceChange) {
                onReferenceChange(newReference);
            }
            
            // Scroll to the highlighted verse (verse 1) after a short delay
            setTimeout(() => {
                if (highlightRef.current) {
                    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } catch (err) {
            console.error('Failed to navigate chapter:', err);
            setIsNavigating(false); // Reset on error
        } finally {
            setChapterLoading(false);
        }
    };

    // Render text with clickable location names
    const renderTextWithLocations = (text: string) => {
        const locations = findLocationsInText(text);
        
        if (locations.length === 0) {
            return text;
        }

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        locations.forEach((location, idx) => {
            // Add text before the location
            if (location.startIndex > lastIndex) {
                elements.push(text.substring(lastIndex, location.startIndex));
            }

            // Add clickable location name
            elements.push(
                <span
                    key={`loc-${idx}`}
                    onClick={() => {
                        if (onLocationClick) {
                            onLocationClick(location.canonical);
                        }
                    }}
                    style={{
                        textDecoration: 'underline',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    {location.text}
                </span>
            );

            lastIndex = location.endIndex;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }

        return elements;
    };

    if (!reference) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Select a location on the map to view related Bible passages
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ 
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}>
                </div>
                <p style={{ marginTop: '10px', color: '#666' }}>Loading Scripture...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '20px', 
                color: '#d32f2f',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                margin: '10px'
            }}>
                {error}
            </div>
        );
    }

    if (verses.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No verses found
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.8',
            maxWidth: '800px'
        }}>
            {/* Reference Header */}
            <div style={{
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '2px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        {verses[0].reference.book} {verses[0].reference.chapter}
                        {!expanded && verses.length === 1 ? `:${verses[0].reference.verse}` : ''}
                    </h2>
                    <p style={{
                        margin: '5px 0 0 0',
                        fontSize: '14px',
                        color: '#666',
                        fontStyle: 'italic'
                    }}>
                        {version}
                    </p>
                </div>
                
                {/* Book Selector Button */}
                <button
                    onClick={() => setShowBookSelector(true)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    title="Select a book"
                >
                    📖 Books
                </button>
            </div>

            {/* Expand Chapter Button */}
            {!expanded && (
                <div style={{ marginBottom: '15px' }}>
                    <button
                        onClick={handleExpandChapter}
                        disabled={chapterLoading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: chapterLoading ? 'wait' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                    >
                        {chapterLoading ? 'Loading...' : 'Show Full Chapter'}
                    </button>
                </div>
            )}

            {/* Single Verse View */}
            {!expanded && (
            <div>
                {verses.map((verse, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: '15px',
                            cursor: onVerseClick ? 'pointer' : 'default',
                            padding: '10px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px'
                        }}
                        onClick={() => handleVerseClick(verse)}
                    >
                        <span style={{
                            display: 'inline-block',
                            minWidth: '30px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#888',
                            verticalAlign: 'super',
                            marginRight: '5px'
                        }}>
                            {verse.reference.verse}
                        </span>
                        <span style={{ fontSize: '16px', color: '#222' }}>
                            {verse.text}
                        </span>

                        {/* Interlinear Display */}
                        {showInterlinear && verse.interlinearWords && verse.interlinearWords.length > 0 && (
                            <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                fontSize: '13px',
                                border: '1px solid #ddd'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '15px'
                                }}>
                                    {verse.interlinearWords.map((word, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: '60px'
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                color: '#1976d2'
                                            }}>
                                                {word.originalText}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#666',
                                                fontStyle: 'italic'
                                            }}>
                                                {word.transliteration}
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#999',
                                                marginTop: '2px'
                                            }}>
                                                {word.strongsNumber}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#333',
                                                marginTop: '4px',
                                                textAlign: 'center'
                                            }}>
                                                {word.englishGloss}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            )}

            {/* Expanded Chapter View */}
            {expanded && fullChapter.length > 0 && (
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '70vh'
                }}>
                    {/* Navigation Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        <button
                            onClick={() => handleNavigateChapter('prev')}
                            disabled={chapterLoading}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#2980b9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: chapterLoading ? 'wait' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            ← Prev
                        </button>
                        <h5 style={{
                            margin: 0,
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}>
                            {verses[0].reference.book} {verses[0].reference.chapter}
                        </h5>
                        <button
                            onClick={() => handleNavigateChapter('next')}
                            disabled={chapterLoading}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#2980b9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: chapterLoading ? 'wait' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Next →
                        </button>
                    </div>

                    {/* Chapter Content - Scrollable */}
                    <div style={{
                        padding: '16px',
                        position: 'relative',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        {chapterLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}>
                                <div style={{ 
                                    display: 'inline-block',
                                    width: '32px',
                                    height: '32px',
                                    border: '3px solid #f3f3f3',
                                    borderTop: '3px solid #3498db',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}>
                                </div>
                            </div>
                        )}
                        {fullChapter.map((verse) => {
                            return (
                                <div
                                    key={verse.verse}
                                    style={{
                                        marginBottom: '8px',
                                        padding: '8px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <span style={{
                                        fontWeight: 'bold',
                                        marginRight: '8px',
                                        fontSize: '14px'
                                    }}>
                                        {verse.verse}.
                                    </span>
                                    {renderTextWithLocations(verse.text)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Collapse Button */}
                    <div
                        onClick={() => setExpanded(false)}
                        style={{
                            padding: '8px',
                            textAlign: 'center',
                            backgroundColor: '#f0f0f0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#3498db',
                            fontWeight: '500'
                        }}
                    >
                        Click to collapse
                    </div>
                </div>
            )}

            {/* Book Selector Modal */}
            {showBookSelector && (
                <BookSelector
                    onBookSelect={(ref) => {
                        if (onReferenceChange) {
                            onReferenceChange(ref);
                        }
                    }}
                    onClose={() => setShowBookSelector(false)}
                />
            )}

            {/* CSS Animation for loading spinner */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VerseReader;