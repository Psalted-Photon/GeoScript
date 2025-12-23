export function parseVerseReference(reference: string): { book: string; chapter: number; verse: number } | null {
    const versePattern = /^(?<book>[1-3]?\s?[A-Za-z]+)\s(?<chapter>\d+):(?<verse>\d+)$/;
    const match = reference.match(versePattern);

    if (match && match.groups) {
        return {
            book: match.groups.book.trim(),
            chapter: parseInt(match.groups.chapter, 10),
            verse: parseInt(match.groups.verse, 10),
        };
    }

    return null;
}

export function linkVerseToLocation(verse: { book: string; chapter: number; verse: number }, locations: any[]): any | null {
    const location = locations.find(loc => loc.verseReference === `${verse.book} ${verse.chapter}:${verse.verse}`);
    return location || null;
}

export function formatVerseForDisplay(verse: { book: string; chapter: number; verse: number }): string {
    return `${verse.book} ${verse.chapter}:${verse.verse}`;
}