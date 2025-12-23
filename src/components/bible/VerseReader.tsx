import React from 'react';
import { useBibleService } from '../../services/bibleService';
import { useVerseLinks } from '../../hooks/useVerseLinks';

const VerseReader: React.FC = () => {
    const { getVerse } = useBibleService();
    const { linkedVerses } = useVerseLinks();

    const [verse, setVerse] = React.useState<string>('');
    const [verseId, setVerseId] = React.useState<string>('1:1'); // Default verse

    React.useEffect(() => {
        const fetchedVerse = getVerse(verseId);
        setVerse(fetchedVerse);
    }, [verseId, getVerse]);

    return (
        <div className="verse-reader">
            <h2>Verse Reader</h2>
            <p>{verse}</p>
            <div className="verse-links">
                {linkedVerses.map((linkedVerse) => (
                    <button key={linkedVerse.id} onClick={() => setVerseId(linkedVerse.id)}>
                        {linkedVerse.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VerseReader;