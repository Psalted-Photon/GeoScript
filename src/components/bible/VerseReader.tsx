import React, { useState, useEffect } from 'react';
import bibleService from '../../services/bibleService';
import { BibleVerse, BibleReference, BibleVersionId, DEFAULT_VERSION } from '../../types/bible';

interface VerseReaderProps {
    reference?: BibleReference;
    version?: BibleVersionId;
    showInterlinear?: boolean;
    onVerseClick?: (ref: BibleReference) => void;
}

const VerseReader: React.FC<VerseReaderProps> = ({
    reference,
    version = DEFAULT_VERSION,
    showInterlinear = false,
    onVerseClick
}) => {
    const [verses, setVerses] = useState<BibleVerse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!reference) return;

        const loadVerses = async () => {
            setLoading(true);
            setError(null);

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
                borderBottom: '2px solid #e0e0e0'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    {verses[0].reference.book} {verses[0].reference.chapter}
                    {verses.length === 1 ? `:${verses[0].reference.verse}` : ''}
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

            {/* Verses */}
            <div>
                {verses.map((verse, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: '15px',
                            cursor: onVerseClick ? 'pointer' : 'default'
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
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                fontSize: '13px'
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