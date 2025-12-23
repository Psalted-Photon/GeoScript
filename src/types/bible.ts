/**
 * Bible version identifiers
 */
export type BibleVersionId = 'KJV' | 'NIV' | 'NET' | 'NASB95' | 'ESV' | 'CSB';

/**
 * Bible version metadata
 */
export interface BibleVersion {
    id: BibleVersionId;
    name: string;
    fullName: string;
    apiIdentifier: string; // Used for API calls
    copyrightYear?: string;
    supportsInterlinear: boolean;
}

/**
 * Canonical Bible reference
 */
export interface BibleReference {
    book: string;
    bookNumber: number; // 1-66
    chapter: number;
    verse: number;
    endVerse?: number; // For verse ranges
}

/**
 * Single Bible verse with metadata
 */
export interface BibleVerse {
    reference: BibleReference;
    text: string;
    version: BibleVersionId;
    interlinearWords?: InterlinearWord[]; // Only present when interlinear mode
}

/**
 * Word-level interlinear data (Hebrew/Greek)
 */
export interface InterlinearWord {
    position: number; // Word order in original language
    originalText: string; // Hebrew/Greek characters
    transliteration: string; // Romanized pronunciation
    strongsNumber: string; // e.g., "H430" or "G2316"
    englishGloss: string; // Basic meaning
    morphology?: string; // Grammar code (e.g., "N-NSM" = Noun, Nominative, Singular, Masculine)
}

/**
 * Strong's concordance entry
 */
export interface StrongsEntry {
    number: string; // "H430" or "G2316"
    lemma: string; // Dictionary form
    transliteration: string;
    pronunciation: string;
    definition: string;
    kjvTranslations: string[]; // How KJV translated it
    occurrences: number; // Times it appears in Bible
}

/**
 * Bible chapter metadata for navigation
 */
export interface ChapterInfo {
    book: string;
    bookNumber: number;
    chapter: number;
    verseCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Link between verse and map location
 */
export interface VerseLink {
    reference: BibleReference;
    locationId: string;
    locationType: 'primary' | 'mentioned' | 'route'; // How verse relates to location
}

/**
 * Available Bible versions with configuration
 */
export const BIBLE_VERSIONS: BibleVersion[] = [
    {
        id: 'KJV',
        name: 'KJV',
        fullName: 'King James Version',
        apiIdentifier: 'kjv',
        copyrightYear: '1611',
        supportsInterlinear: true
    },
    {
        id: 'NIV',
        name: 'NIV',
        fullName: 'New International Version',
        apiIdentifier: 'niv',
        copyrightYear: '2011',
        supportsInterlinear: false
    },
    {
        id: 'NET',
        name: 'NET',
        fullName: 'New English Translation',
        apiIdentifier: 'net',
        supportsInterlinear: false
    },
    {
        id: 'NASB95',
        name: 'NASB95',
        fullName: 'New American Standard Bible 1995',
        apiIdentifier: 'nasb1995',
        copyrightYear: '1995',
        supportsInterlinear: false
    },
    {
        id: 'ESV',
        name: 'ESV',
        fullName: 'English Standard Version',
        apiIdentifier: 'esv',
        copyrightYear: '2016',
        supportsInterlinear: false
    },
    {
        id: 'CSB',
        name: 'CSB',
        fullName: 'Christian Standard Bible',
        apiIdentifier: 'csb',
        copyrightYear: '2017',
        supportsInterlinear: false
    }
];

/**
 * Default Bible version
 */
export const DEFAULT_VERSION: BibleVersionId = 'KJV';