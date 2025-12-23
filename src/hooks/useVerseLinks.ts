import { useState, useEffect } from 'react';
import { fetchVerseLinks } from '../services/bibleService';
import { Location } from '../types/location';

const useVerseLinks = (verseId: string) => {
    const [verseLinks, setVerseLinks] = useState<Location[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVerseLinks = async () => {
            try {
                setLoading(true);
                const links = await fetchVerseLinks(verseId);
                setVerseLinks(links);
            } catch (err) {
                setError('Failed to load verse links');
            } finally {
                setLoading(false);
            }
        };

        loadVerseLinks();
    }, [verseId]);

    return { verseLinks, loading, error };
};

export default useVerseLinks;