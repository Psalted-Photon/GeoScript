import React, { useState, useEffect } from 'react';
import bibleService from '../../services/bibleService';
import { BibleVerse, BibleReference, BibleVersionId, BIBLE_VERSIONS } from '../../types/bible';

interface ParallelReaderProps {
    reference?: BibleReference;
    versions?: BibleVersionId[];
    onVerseClick?: (ref: BibleReference) => void;
}

const ParallelReader: React.FC<ParallelReaderProps> = ({
    reference,
    versions = ['KJV', 'NIV', 'ESV'],
    onVerseClick
}) => {
    const [versesMap, setVersesMap] = useState<Map<BibleVersionId, BibleVerse[]>>(new Map());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!reference) return;

        const loadAllVersions = async () => {
            setLoading(true);
            setError(null);

            try {
                const newVersesMap = new Map<BibleVersionId, BibleVerse[]>();
                
                // Fetch all versions in parallel
                const fetchPromises = versions.map(async (version) => {
                    const verses = await bibleService.fetchVerses(reference, version);
                    return { version, verses };
                });

                const results = await Promise.all(fetchPromises);
                
                results.forEach(({ version, verses }) => {
                    newVersesMap.set(version, verses);
                });

                setVersesMap(newVersesMap);
            } catch (err) {
                setError('Failed to load parallel versions. Please try again.');
                console.error('Error loading parallel verses:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAllVersions();
    }, [reference, versions.join(',')]); // Only re-fetch if reference or versions list changes

    const handleVerseClick = (verse: BibleVerse) => {
        if (onVerseClick) {
            onVerseClick(verse.reference);
        }
    };

    if (!reference) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Select a location on the map to compare Bible versions
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
                <p style={{ marginTop: '10px', color: '#666' }}>Loading translations...</p>
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

    return (
        <div style={{ padding: '20px' }}>
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
                    {reference.book} {reference.chapter}:{reference.verse}
                    {reference.endVerse && `-${reference.endVerse}`}
                </h2>
                <p style={{
                    margin: '5px 0 0 0',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    Comparing {versions.length} translations
                </p>
            </div>

            {/* Parallel Columns */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: versions.length === 2 
                    ? 'repeat(2, 1fr)' 
                    : versions.length === 3 
                        ? 'repeat(3, 1fr)'
                        : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                maxWidth: '1400px'
            }}>
                {versions.map((versionId) => {
                    const verses = versesMap.get(versionId) || [];
                    const versionInfo = BIBLE_VERSIONS.find(v => v.id === versionId);

                    return (
                        <div
                            key={versionId}
                            style={{
                                padding: '15px',
                                backgroundColor: '#fafafa',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                cursor: onVerseClick ? 'pointer' : 'default',
                                transition: 'box-shadow 0.2s',
                            }}
                            onClick={() => verses.length > 0 && handleVerseClick(verses[0])}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Version Label */}
                            <div style={{
                                marginBottom: '10px',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #ddd'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#1976d2'
                                }}>
                                    {versionInfo?.name}
                                </div>
                                <div style={{
                                    fontSize: '10px',
                                    color: '#999',
                                    marginTop: '2px'
                                }}>
                                    {versionInfo?.fullName}
                                </div>
                            </div>

                            {/* Verse Text */}
                            <div style={{
                                fontFamily: 'Georgia, serif',
                                fontSize: '15px',
                                lineHeight: '1.7',
                                color: '#333'
                            }}>
                                {verses.length > 0 ? (
                                    verses.map((verse, idx) => (
                                        <div key={idx} style={{ marginBottom: '10px' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                color: '#888',
                                                verticalAlign: 'super',
                                                marginRight: '4px'
                                            }}>
                                                {verse.reference.verse}
                                            </span>
                                            {verse.text}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', fontStyle: 'italic' }}>
                                        Loading...
                                    </div>
                                )}
                            </div>

                            {/* Copyright */}
                            {versionInfo?.copyrightYear && (
                                <div style={{
                                    marginTop: '10px',
                                    fontSize: '9px',
                                    color: '#aaa',
                                    textAlign: 'right'
                                }}>
                                    © {versionInfo.copyrightYear}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ParallelReader;