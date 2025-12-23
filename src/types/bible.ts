export interface Verse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface Bible {
    version: string;
    verses: Verse[];
}

export interface VerseLink {
    verse: Verse;
    locationId: string;
}