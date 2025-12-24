import { 
    BibleVerse, 
    BibleReference, 
    BibleVersionId, 
    InterlinearWord,
    StrongsEntry,
    ChapterInfo,
    BIBLE_VERSIONS,
    DEFAULT_VERSION
} from '../types/bible';
import bibleCache from '../utils/bibleCache';

/**
 * Response from Bolls.life API
 */
interface BollsVerseResponse {
    pk: number;
    verse: number;
    text: string;
    comment?: string;
}

/**
 * Chapter verse with metadata
 */
interface ChapterVerse {
    number: number;
    text: string;
}

/**
 * Bible book metadata
 */
interface BibleBook {
    name: string;
    number: number;
    chapters: number;
}

// All 66 books of the Bible with chapter counts (from LampStand)
const BIBLE_BOOKS: BibleBook[] = [
    { name: 'Genesis', number: 1, chapters: 50 },
    { name: 'Exodus', number: 2, chapters: 40 },
    { name: 'Leviticus', number: 3, chapters: 27 },
    { name: 'Numbers', number: 4, chapters: 36 },
    { name: 'Deuteronomy', number: 5, chapters: 34 },
    { name: 'Joshua', number: 6, chapters: 24 },
    { name: 'Judges', number: 7, chapters: 21 },
    { name: 'Ruth', number: 8, chapters: 4 },
    { name: '1 Samuel', number: 9, chapters: 31 },
    { name: '2 Samuel', number: 10, chapters: 24 },
    { name: '1 Kings', number: 11, chapters: 22 },
    { name: '2 Kings', number: 12, chapters: 25 },
    { name: '1 Chronicles', number: 13, chapters: 29 },
    { name: '2 Chronicles', number: 14, chapters: 36 },
    { name: 'Ezra', number: 15, chapters: 10 },
    { name: 'Nehemiah', number: 16, chapters: 13 },
    { name: 'Esther', number: 17, chapters: 10 },
    { name: 'Job', number: 18, chapters: 42 },
    { name: 'Psalms', number: 19, chapters: 150 },
    { name: 'Proverbs', number: 20, chapters: 31 },
    { name: 'Ecclesiastes', number: 21, chapters: 12 },
    { name: 'Song of Solomon', number: 22, chapters: 8 },
    { name: 'Isaiah', number: 23, chapters: 66 },
    { name: 'Jeremiah', number: 24, chapters: 52 },
    { name: 'Lamentations', number: 25, chapters: 5 },
    { name: 'Ezekiel', number: 26, chapters: 48 },
    { name: 'Daniel', number: 27, chapters: 12 },
    { name: 'Hosea', number: 28, chapters: 14 },
    { name: 'Joel', number: 29, chapters: 3 },
    { name: 'Amos', number: 30, chapters: 9 },
    { name: 'Obadiah', number: 31, chapters: 1 },
    { name: 'Jonah', number: 32, chapters: 4 },
    { name: 'Micah', number: 33, chapters: 7 },
    { name: 'Nahum', number: 34, chapters: 3 },
    { name: 'Habakkuk', number: 35, chapters: 3 },
    { name: 'Zephaniah', number: 36, chapters: 3 },
    { name: 'Haggai', number: 37, chapters: 2 },
    { name: 'Zechariah', number: 38, chapters: 14 },
    { name: 'Malachi', number: 39, chapters: 4 },
    { name: 'Matthew', number: 40, chapters: 28 },
    { name: 'Mark', number: 41, chapters: 16 },
    { name: 'Luke', number: 42, chapters: 24 },
    { name: 'John', number: 43, chapters: 21 },
    { name: 'Acts', number: 44, chapters: 28 },
    { name: 'Romans', number: 45, chapters: 16 },
    { name: '1 Corinthians', number: 46, chapters: 16 },
    { name: '2 Corinthians', number: 47, chapters: 13 },
    { name: 'Galatians', number: 48, chapters: 6 },
    { name: 'Ephesians', number: 49, chapters: 6 },
    { name: 'Philippians', number: 50, chapters: 4 },
    { name: 'Colossians', number: 51, chapters: 4 },
    { name: '1 Thessalonians', number: 52, chapters: 5 },
    { name: '2 Thessalonians', number: 53, chapters: 3 },
    { name: '1 Timothy', number: 54, chapters: 6 },
    { name: '2 Timothy', number: 55, chapters: 4 },
    { name: 'Titus', number: 56, chapters: 3 },
    { name: 'Philemon', number: 57, chapters: 1 },
    { name: 'Hebrews', number: 58, chapters: 13 },
    { name: 'James', number: 59, chapters: 5 },
    { name: '1 Peter', number: 60, chapters: 5 },
    { name: '2 Peter', number: 61, chapters: 3 },
    { name: '1 John', number: 62, chapters: 5 },
    { name: '2 John', number: 63, chapters: 1 },
    { name: '3 John', number: 64, chapters: 1 },
    { name: 'Jude', number: 65, chapters: 1 },
    { name: 'Revelation', number: 66, chapters: 22 },
];

/**
 * BibleService handles all Bible text fetching using Bolls.life API
 */
class BibleService {
    private memoryCache: Map<string, BibleVerse[]> = new Map();
    private strongsCache: Map<string, StrongsEntry> = new Map();
    private bollsApiUrl = 'https://bolls.life';
    private initialized = false;

    /**
     * Initialize the service and IndexedDB
     */
    async init(): Promise<void> {
        if (this.initialized) return;
        
        try {
            await bibleCache.init();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Bible cache:', error);
            this.initialized = true;
        }
    }

    /**
     * Fetch verses from Bolls.life API with caching
     */
    async fetchVerses(
        reference: BibleReference,
        version: BibleVersionId = DEFAULT_VERSION
    ): Promise<BibleVerse[]> {
        await this.init();
        
        const cacheKey = this.getCacheKey(reference, version);
        
        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            return this.memoryCache.get(cacheKey)!;
        }

        // Check IndexedDB cache
        const cachedVerses = await bibleCache.get(cacheKey);
        if (cachedVerses) {
            this.memoryCache.set(cacheKey, cachedVerses);
            return cachedVerses;
        }

        // Fetch from Bolls.life API
        try {
            const verses: BibleVerse[] = [];
            const endVerse = reference.endVerse || reference.verse;
            
            for (let v = reference.verse; v <= endVerse; v++) {
                const verseData = await this.fetchSingleVerse(
                    reference.bookNumber,
                    reference.chapter,
                    v,
                    version
                );
                
                if (verseData) {
                    const verse: BibleVerse = {
                        reference: {
                            ...reference,
                            verse: v,
                            endVerse: undefined
                        },
                        text: this.cleanVerseText(verseData.text),
                        version: version
                    };
                    
                    // Parse Strong's numbers for KJV
                    if (version === 'KJV') {
                        verse.interlinearWords = this.parseStrongsNumbers(verseData.text);
                    }
                    
                    verses.push(verse);
                }
            }

            if (verses.length > 0) {
                // Cache the result
                this.memoryCache.set(cacheKey, verses);
                await bibleCache.set(cacheKey, verses, version, reference.book);
            }
            
            return verses;
        } catch (error) {
            console.error('Error fetching Bible verses from Bolls.life:', error);
            return [{
                reference,
                text: `[Verse not available: ${reference.book} ${reference.chapter}:${reference.verse} - API error: ${error}]`,
                version
            }];
        }
    }

    /**
     * Fetch a single verse from Bolls.life API
     */
    private async fetchSingleVerse(
        bookNumber: number,
        chapter: number,
        verse: number,
        version: BibleVersionId
    ): Promise<BollsVerseResponse | null> {
        try {
            const url = `${this.bollsApiUrl}/get-verse/${version}/${bookNumber}/${chapter}/${verse}/`;
            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            const data: BollsVerseResponse = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching verse ${bookNumber}:${chapter}:${verse}:`, error);
            return null;
        }
    }

    /**
     * Fetch entire chapter from Bolls.life API
     */
    async fetchChapter(
        bookNumber: number,
        chapter: number,
        version: BibleVersionId = DEFAULT_VERSION
    ): Promise<ChapterVerse[]> {
        const verses: ChapterVerse[] = [];
        let verseNum = 1;
        
        // Loop until we get a 404 (no more verses in chapter)
        while (verseNum <= 200) { // Safety limit
            const verseData = await this.fetchSingleVerse(bookNumber, chapter, verseNum, version);
            
            if (!verseData) {
                break;
            }
            
            verses.push({
                number: verseNum,
                text: this.cleanVerseText(verseData.text)
            });
            
            verseNum++;
        }
        
        return verses;
    }

    /**
     * Get next chapter with infinite looping (Revelation 22 → Genesis 1)
     */
    getNextChapter(bookNumber: number, chapter: number): { bookNumber: number; chapter: number } {
        const book = BIBLE_BOOKS.find(b => b.number === bookNumber);
        if (!book) return { bookNumber: 1, chapter: 1 };
        
        // If not last chapter of book, go to next chapter
        if (chapter < book.chapters) {
            return { bookNumber, chapter: chapter + 1 };
        }
        
        // Last chapter of book - go to first chapter of next book
        if (bookNumber < 66) {
            return { bookNumber: bookNumber + 1, chapter: 1 };
        }
        
        // Revelation 22 - wrap to Genesis 1
        return { bookNumber: 1, chapter: 1 };
    }

    /**
     * Get previous chapter with infinite looping (Genesis 1 → Revelation 22)
     */
    getPreviousChapter(bookNumber: number, chapter: number): { bookNumber: number; chapter: number } {
        // If not first chapter of book, go to previous chapter
        if (chapter > 1) {
            return { bookNumber, chapter: chapter - 1 };
        }
        
        // First chapter of book - go to last chapter of previous book
        if (bookNumber > 1) {
            const prevBook = BIBLE_BOOKS.find(b => b.number === bookNumber - 1);
            if (prevBook) {
                return { bookNumber: prevBook.number, chapter: prevBook.chapters };
            }
        }
        
        // Genesis 1 - wrap to Revelation 22
        return { bookNumber: 66, chapter: 22 };
    }

    /**
     * Parse Strong's numbers from KJV text
     * KJV text contains tags like: "For<S>1063</S> God<S>2316</S>"
     */
    private parseStrongsNumbers(kjvText: string): InterlinearWord[] {
        const words: InterlinearWord[] = [];
        const regex = /(\w+(?:'[ts])?)<S>(\d+)<\/S>/g;
        let match;
        let position = 1;
        
        while ((match = regex.exec(kjvText)) !== null) {
            const englishWord = match[1];
            const strongsNum = match[2];
            const prefix = parseInt(strongsNum) < 10000 ? 'H' : 'G'; // Hebrew or Greek
            
            words.push({
                position: position++,
                originalText: '', // Would need separate lookup
                transliteration: '',
                strongsNumber: prefix + strongsNum,
                englishGloss: englishWord,
                morphology: undefined
            });
        }
        
        return words;
    }

    /**
     * Clean verse text by removing HTML and Strong's tags
     */
    private cleanVerseText(text: string): string {
        // Remove Strong's number tags
        let cleaned = text.replace(/<S>\d+<\/S>/g, '');
        // Remove any other HTML tags
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        // Decode HTML entities
        cleaned = this.decodeHtmlEntities(cleaned);
        return cleaned.trim();
    }

    /**
     * Decode HTML entities
     */
    private decodeHtmlEntities(text: string): string {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    /**
     * Fetch interlinear data (uses Strong's numbers from KJV)
     */
    async fetchInterlinear(reference: BibleReference): Promise<InterlinearWord[]> {
        // Fetch KJV verse which contains Strong's numbers
        const kjvVerses = await this.fetchVerses(reference, 'KJV');
        
        if (kjvVerses.length > 0 && kjvVerses[0].interlinearWords) {
            return kjvVerses[0].interlinearWords;
        }
        
        return [];
    }

    /**
     * Fetch Strong's concordance entry
     */
    async fetchStrongsEntry(strongsNumber: string): Promise<StrongsEntry | null> {
        if (this.strongsCache.has(strongsNumber)) {
            return this.strongsCache.get(strongsNumber)!;
        }

        try {
            // Using STEPBible API for Strong's lookups
            const response = await fetch(
                `https://api.stepbible.org/strongs?reference=${strongsNumber}`
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            
            const entry: StrongsEntry = {
                number: strongsNumber,
                lemma: data.lemma || '',
                transliteration: data.transliteration || '',
                pronunciation: data.pronunciation || '',
                definition: data.definition || '',
                kjvTranslations: data.kjv_translations || [],
                occurrences: data.occurrences || 0
            };

            this.strongsCache.set(strongsNumber, entry);
            return entry;
        } catch (error) {
            console.error('Error fetching Strong\'s entry:', error);
            return null;
        }
    }

    /**
     * Get chapter info for navigation
     */
    getChapterInfo(reference: BibleReference): ChapterInfo {
        const book = BIBLE_BOOKS.find(b => b.number === reference.bookNumber);
        const verseCount = book?.chapters || 0;
        
        return {
            book: reference.book,
            bookNumber: reference.bookNumber,
            chapter: reference.chapter,
            verseCount,
            hasNext: reference.chapter < (book?.chapters || 0),
            hasPrevious: reference.chapter > 1
        };
    }

    /**
     * Parse a reference string like "John 3:16" or "Genesis 12:1-3" into BibleReference
     */
    parseReference(refString: string): BibleReference | null {
        const match = refString.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) return null;

        const [, book, chapter, verse, endVerse] = match;
        const bookNumber = this.getBookNumber(book.trim());
        
        if (!bookNumber) return null;
        
        return {
            book: book.trim(),
            bookNumber,
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            endVerse: endVerse ? parseInt(endVerse) : undefined
        };
    }

    /**
     * Build reference string from BibleReference object
     */
    buildReferenceString(ref: BibleReference): string {
        const verseRange = ref.endVerse ? `${ref.verse}-${ref.endVerse}` : `${ref.verse}`;
        return `${ref.book} ${ref.chapter}:${verseRange}`;
    }

    /**
     * Generate cache key for verse lookup
     */
    private getCacheKey(ref: BibleReference, version: BibleVersionId): string {
        return `${version}:${ref.book}:${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`;
    }

    /**
     * Get book number (1-66) from book name
     */
    getBookNumber(bookName: string): number | null {
        const normalizedName = bookName.toLowerCase().trim();
        
        // Direct name lookup
        const book = BIBLE_BOOKS.find(b => b.name.toLowerCase() === normalizedName);
        if (book) return book.number;
        
        // Common abbreviations
        const abbreviations: Record<string, number> = {
            'gen': 1, 'exo': 2, 'ex': 2, 'lev': 3, 'num': 4, 'deut': 5, 'deu': 5,
            'josh': 6, 'jos': 6, 'judg': 7, 'jdg': 7, 'rut': 8,
            '1sam': 9, '1 sam': 9, '2sam': 10, '2 sam': 10,
            '1ki': 11, '1 ki': 11, '2ki': 12, '2 ki': 12,
            '1chr': 13, '1 chr': 13, '2chr': 14, '2 chr': 14,
            'ezr': 15, 'neh': 16, 'est': 17,
            'ps': 19, 'psa': 19, 'prov': 20, 'pro': 20, 'eccl': 21, 'ecc': 21,
            'song': 22, 'sng': 22, 'isa': 23, 'jer': 24, 'lam': 25,
            'ezek': 26, 'ezk': 26, 'dan': 27, 'hos': 28,
            'joel': 29, 'amo': 30, 'obad': 31, 'oba': 31, 'jon': 32,
            'mic': 33, 'nah': 34, 'nam': 34, 'hab': 35,
            'zeph': 36, 'zep': 36, 'hag': 37,
            'zech': 38, 'zec': 38, 'mal': 39,
            'matt': 40, 'mat': 40, 'mt': 40, 'mrk': 41, 'mk': 41,
            'luk': 42, 'lk': 42, 'jhn': 43, 'jn': 43, 'act': 44,
            'rom': 45, '1cor': 46, '1 cor': 46, '2cor': 47, '2 cor': 47,
            'gal': 48, 'eph': 49, 'phil': 50, 'php': 50,
            'col': 51, '1thess': 52, '1 thess': 52, '2thess': 53, '2 thess': 53,
            '1tim': 54, '1 tim': 54, '2tim': 55, '2 tim': 55,
            'tit': 56, 'phlm': 57, 'phm': 57, 'heb': 58,
            'jas': 59, '1pet': 60, '1 pet': 60, '2pet': 61, '2 pet': 61,
            '1jn': 62, '1 jn': 62, '2jn': 63, '2 jn': 63,
            '3jn': 64, '3 jn': 64, 'jude': 65, 'rev': 66
        };
        
        return abbreviations[normalizedName] || null;
    }

    /**
     * Get book name from book number
     */
    getBookName(bookNumber: number): string {
        const book = BIBLE_BOOKS.find(b => b.number === bookNumber);
        return book?.name || '';
    }

    /**
     * Clear all caches
     */
    async clearCache(): Promise<void> {
        this.memoryCache.clear();
        this.strongsCache.clear();
        await bibleCache.clear();
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        return await bibleCache.getStats();
    }
}

export default new BibleService();
