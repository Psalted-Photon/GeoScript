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
 * Response structure from Bible SuperSearch API (SWORD modules)
 */
interface BibleSuperSearchResponse {
    results: {
        [version: string]: Array<{
            book: string;
            chapter: number;
            verse: number;
            text: string;
        }>;
    };
}

/**
 * Response structure for interlinear data
 */
interface InterlinearResponse {
    words: Array<{
        original: string;
        transliteration: string;
        strongs: string;
        gloss: string;
        morphology?: string;
    }>;
}

/**
 * BibleService handles all Bible text fetching using SWORD modules
 */
class BibleService {
    private memoryCache: Map<string, BibleVerse[]> = new Map();
    private strongsCache: Map<string, StrongsEntry> = new Map();
    private swordApiUrl = 'https://api.biblesupersearch.com/api';
    private initialized = false;
    
    // SWORD module mappings for each version
    private versionModules: { [key in BibleVersionId]: string } = {
        'KJV': 'KJV',
        'NIV': 'His parents went to Jerusalem every year for the Passover.',
        'NET': 'His parents went to Jerusalem every year for the Passover.',
        'NASB95': 'NASB',
        'ESV': 'ESV',
        'CSB': 'HCSB' // Christian Standard Bible uses HCSB module
    };

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
            // Continue without cache if initialization fails
            this.initialized = true;
        }
    }

    /**
     * Fetch verses from Bible SuperSearch API (SWORD modules) with caching
     */
    async fetchVerses(
        reference: BibleReference,
        version: BibleVersionId = DEFAULT_VERSION
    ): Promise<BibleVerse[]> {
        await this.init();
        
        const cacheKey = this.getCacheKey(reference, version);
        
        // Check memory cache first (fastest)
        if (this.memoryCache.has(cacheKey)) {
            return this.memoryCache.get(cacheKey)!;
        }

        // Check IndexedDB cache (fast)
        const cachedVerses = await bibleCache.get(cacheKey);
        if (cachedVerses) {
            this.memoryCache.set(cacheKey, cachedVerses);
            return cachedVerses;
        }

        // Fetch from SWORD API (slow)
        try {
            const module = this.versionModules[version];
            const refString = this.buildReferenceString(reference);
            
            // Bible SuperSearch API supports SWORD modules
            const response = await fetch(
                `${this.swordApiUrl}?bible=${module}&reference=${encodeURIComponent(refString)}&format=json`
            );

            if (!response.ok) {
                throw new Error(`SWORD API error: ${response.statusText}`);
            }

            const data: BibleSuperSearchResponse = await response.json();
            
            // Extract verses from response
            const moduleResults = data.results[module] || [];
            
            const verses: BibleVerse[] = moduleResults.map(v => ({
                reference: {
                    book: v.book,
                    bookNumber: this.getBookNumber(v.book),
                    chapter: v.chapter,
                    verse: v.verse
                },
                text: v.text.replace(/<[^>]*>/g, ''), // Strip HTML tags
                version: version
            }));

            if (verses.length === 0) {
                // Fallback to mock data if API fails
                console.warn('No verses returned from SWORD API, using mock data');
                return this.getMockVerse(reference, version);
            }

            // Cache the result in both memory and IndexedDB
            this.memoryCache.set(cacheKey, verses);
            await bibleCache.set(cacheKey, verses, version, reference.book);
            
            return verses;
        } catch (error) {
            console.error('Error fetching Bible verses from SWORD:', error);
            // Return placeholder data for development
            return this.getMockVerse(reference, version);
        }
    }

    /**
     * Fetch interlinear data (Hebrew/Greek with Strong's numbers)
     * Uses SWORD modules with Strong's tagging
     */
    async fetchInterlinear(reference: BibleReference): Promise<InterlinearWord[]> {
        const cacheKey = `interlinear:${this.buildReferenceString(reference)}`;
        
        try {
            const refString = this.buildReferenceString(reference);
            
            // Use SWORD modules with Strong's numbers (KJV with Strong's)
            const response = await fetch(
                `${this.swordApiUrl}?bible=KJVStrongs&reference=${encodeURIComponent(refString)}&format=json&strongs=1`
            );

            if (!response.ok) {
                console.warn('Interlinear data not available, using mock data');
                return this.getMockInterlinear(reference);
            }

            const data = await response.json();
            
            // Parse Strong's tagged text
            const words = this.parseStrongsTaggedText(data.results?.KJVStrongs?.[0]?.text || '');
            
            return words;
        } catch (error) {
            console.error('Error fetching interlinear data:', error);
            // Return mock interlinear for demonstration
            return this.getMockInterlinear(reference);
        }
    }

    /**
     * Parse Strong's tagged text from SWORD modules
     */
    private parseStrongsTaggedText(text: string): InterlinearWord[] {
        const words: InterlinearWord[] = [];
        
        // SWORD Strong's format: <w lemma="strong:H430">God</w>
        const regex = /<w\s+lemma="strong:([HG]\d+)">([^<]+)<\/w>/g;
        let match;
        let position = 1;
        
        while ((match = regex.exec(text)) !== null) {
            const strongsNum = match[1];
            const englishWord = match[2];
            
            words.push({
                position: position++,
                originalText: '', // Will be populated from Strong's lookup
                transliteration: '',
                strongsNumber: strongsNum,
                englishGloss: englishWord,
                morphology: undefined
            });
        }
        
        return words;
    }

    /**
     * Get mock interlinear data for demonstration
     */
    private getMockInterlinear(reference: BibleReference): InterlinearWord[] {
        // Example from John 3:16 in Greek
        if (reference.book.toLowerCase().includes('john') && reference.chapter === 3 && reference.verse === 16) {
            return [
                {
                    position: 1,
                    originalText: 'οὕτως',
                    transliteration: 'houtōs',
                    strongsNumber: 'G3779',
                    englishGloss: 'so',
                    morphology: 'ADV'
                },
                {
                    position: 2,
                    originalText: 'γὰρ',
                    transliteration: 'gar',
                    strongsNumber: 'G1063',
                    englishGloss: 'for',
                    morphology: 'CONJ'
                },
                {
                    position: 3,
                    originalText: 'ἠγάπησεν',
                    transliteration: 'ēgapēsen',
                    strongsNumber: 'G25',
                    englishGloss: 'loved',
                    morphology: 'V-AAI-3S'
                },
                {
                    position: 4,
                    originalText: 'ὁ',
                    transliteration: 'ho',
                    strongsNumber: 'G3588',
                    englishGloss: 'the',
                    morphology: 'T-NSM'
                },
                {
                    position: 5,
                    originalText: 'Θεὸς',
                    transliteration: 'Theos',
                    strongsNumber: 'G2316',
                    englishGloss: 'God',
                    morphology: 'N-NSM'
                },
                {
                    position: 6,
                    originalText: 'τὸν',
                    transliteration: 'ton',
                    strongsNumber: 'G3588',
                    englishGloss: 'the',
                    morphology: 'T-ASM'
                },
                {
                    position: 7,
                    originalText: 'κόσμον',
                    transliteration: 'kosmon',
                    strongsNumber: 'G2889',
                    englishGloss: 'world',
                    morphology: 'N-ASM'
                }
            ];
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
            // Using a free Strong's API or local data
            const response = await fetch(
                `https://api.stepbible.org/strongs?reference=${strongsNumber}`
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            
            const entry: StrongsEntry = {
                number: strongsNumber,
                lemma: data.lemma,
                transliteration: data.transliteration,
                pronunciation: data.pronunciation,
                definition: data.definition,
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
        const verseCounts = this.getVerseCountsForBook(reference.book);
        const verseCount = verseCounts[reference.chapter - 1] || 0;
        
        return {
            book: reference.book,
            bookNumber: reference.bookNumber,
            chapter: reference.chapter,
            verseCount,
            hasNext: reference.chapter < verseCounts.length,
            hasPrevious: reference.chapter > 1
        };
    }

    /**
     * Parse a reference string like "John 3:16" into BibleReference
     */
    parseReference(refString: string): BibleReference | null {
        const match = refString.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) return null;

        const [, book, chapter, verse, endVerse] = match;
        
        return {
            book: book.trim(),
            bookNumber: this.getBookNumber(book.trim()),
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            endVerse: endVerse ? parseInt(endVerse) : undefined
        };
    }

    /**
     * Build reference string from BibleReference object
     */
    private buildReferenceString(ref: BibleReference): string {
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
    private getBookNumber(bookName: string): number {
        const books = [
            'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
            '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
            'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
            'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
            'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
            'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
            'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
            '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
            '1 John', '2 John', '3 John', 'Jude', 'Revelation'
        ];
        
        const index = books.findIndex(b => b.toLowerCase() === bookName.toLowerCase());
        return index >= 0 ? index + 1 : 1;
    }

    /**
     * Get verse counts for each chapter in a book
     */
    private getVerseCountsForBook(bookName: string): number[] {
        // Simplified - in production, use complete verse count data
        const verseCounts: { [key: string]: number[] } = {
            'John': [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
            'Matthew': [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
            'Genesis': [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26]
        };
        
        return verseCounts[bookName] || [31]; // Default to one chapter with 31 verses
    }

    /**
     * Get mock verse for development/testing with actual verse text
     */
    private getMockVerse(ref: BibleReference, version: BibleVersionId): BibleVerse[] {
        // Genesis verses - Creation and Patriarchs
        const genesisTexts: { [chapter: number]: { [verse: number]: { [key in BibleVersionId]: string } } } = {
            1: {
                1: {
                    KJV: 'In the beginning God created the heaven and the earth.',
                    NIV: 'In the beginning God created the heavens and the earth.',
                    ESV: 'In the beginning, God created the heavens and the earth.',
                    NASB95: 'In the beginning God created the heavens and the earth.',
                    NET: 'In the beginning God created the heavens and the earth.',
                    CSB: 'In the beginning God created the heavens and the earth.'
                },
                27: {
                    KJV: 'So God created man in his own image, in the image of God created he him; male and female created he them.',
                    NIV: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.',
                    ESV: 'So God created man in his own image, in the image of God he created him; male and female he created them.',
                    NASB95: 'God created man in His own image, in the image of God He created him; male and female He created them.',
                    NET: 'God created humankind in his own image, in the image of God he created them, male and female he created them.',
                    CSB: 'So God created man in his own image; he created him in the image of God; he created them male and female.'
                }
            },
            2: {
                8: {
                    KJV: 'And the LORD God planted a garden eastward in Eden; and there he put the man whom he had formed.',
                    NIV: 'Now the LORD God had planted a garden in the east, in Eden; and there he put the man he had formed.',
                    ESV: 'And the LORD God planted a garden in Eden, in the east, and there he put the man whom he had formed.',
                    NASB95: 'The LORD God planted a garden toward the east, in Eden; and there He placed the man whom He had formed.',
                    NET: 'The LORD God planted an orchard in the east, in Eden; and there he placed the man he had formed.',
                    CSB: 'The LORD God planted a garden in Eden, in the east, and there he placed the man he had formed.'
                }
            },
            12: {
                1: {
                    KJV: 'Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father' + String.fromCharCode(39) + 's house, unto a land that I will shew thee:',
                    NIV: 'The LORD had said to Abram, "Go from your country, your people and your father' + String.fromCharCode(39) + 's household to the land I will show you.',
                    ESV: 'Now the LORD said to Abram, "Go from your country and your kindred and your father' + String.fromCharCode(39) + 's house to the land that I will show you.',
                    NASB95: 'Now the LORD said to Abram, "Go forth from your country, And from your relatives And from your father' + String.fromCharCode(39) + 's house, To the land which I will show you;',
                    NET: 'Now the LORD said to Abram, "Go out from your country, your relatives, and your father' + String.fromCharCode(39) + 's household to the land that I will show you.',
                    CSB: 'The LORD said to Abram: Go from your land, your relatives, and your father' + String.fromCharCode(39) + 's house to the land that I will show you.'
                },
                7: {
                    KJV: 'And the LORD appeared unto Abram, and said, Unto thy seed will I give this land: and there builded he an altar unto the LORD, who appeared unto him.',
                    NIV: 'The LORD appeared to Abram and said, "To your offspring I will give this land." So he built an altar there to the LORD, who had appeared to him.',
                    ESV: 'Then the LORD appeared to Abram and said, "To your offspring I will give this land." So he built there an altar to the LORD, who had appeared to him.',
                    NASB95: 'The LORD appeared to Abram and said, "To your descendants I will give this land." So he built an altar there to the LORD who had appeared to him.',
                    NET: 'The LORD appeared to Abram and said, "To your descendants I will give this land." So Abram built an altar there to the LORD, who had appeared to him.',
                    CSB: 'The LORD appeared to Abram and said, "I will give this land to your offspring." So he built an altar there to the LORD who had appeared to him.'
                }
            },
            28: {
                12: {
                    KJV: 'And he dreamed, and behold a ladder set up on the earth, and the top of it reached to heaven: and behold the angels of God ascending and descending on it.',
                    NIV: 'He had a dream in which he saw a stairway resting on the earth, with its top reaching to heaven, and the angels of God were ascending and descending on it.',
                    ESV: 'And he dreamed, and behold, there was a ladder set up on the earth, and the top of it reached to heaven. And behold, the angels of God were ascending and descending on it!',
                    NASB95: 'He had a dream, and behold, a ladder was set on the earth with its top reaching to heaven; and behold, the angels of God were ascending and descending on it.',
                    NET: 'and had a dream. He saw a stairway erected on the earth with its top reaching to the heavens. The angels of God were going up and coming down it',
                    CSB: 'And he dreamed: A stairway was set on the ground with its top reaching the sky, and God' + String.fromCharCode(39) + 's angels were going up and down on it.'
                }
            },
            32: {
                28: {
                    KJV: 'And he said, Thy name shall be called no more Jacob, but Israel: for as a prince hast thou power with God and with men, and hast prevailed.',
                    NIV: 'Then the man said, "Your name will no longer be Jacob, but Israel, because you have struggled with God and with humans and have overcome."',
                    ESV: 'Then he said, "Your name shall no longer be called Jacob, but Israel, for you have striven with God and with men, and have prevailed."',
                    NASB95: 'He said, "Your name shall no longer be Jacob, but Israel; for you have striven with God and with men and have prevailed."',
                    NET: 'The man said, "Your name will no longer be Jacob, but Israel, because you have fought with God and with men and have prevailed."',
                    CSB: 'Then he said, "Your name will no longer be Jacob. It will be Israel because you have struggled with God and with men and have prevailed."'
                }
            }
        };

        // Luke 2 verses
        const luke2Texts: { [verse: number]: { [key in BibleVersionId]: string } } = {
            4: {
                KJV: 'And Joseph also went up from Galilee, out of the city of Nazareth, into Judaea, unto the city of David, which is called Bethlehem; (because he was of the house and lineage of David:)',
                NIV: 'So Joseph also went up from the town of Nazareth in Galilee to Judea, to Bethlehem the town of David, because he belonged to the house and line of David.',
                ESV: 'And Joseph also went up from Galilee, from the town of Nazareth, to Judea, to the city of David, which is called Bethlehem, because he was of the house and lineage of David,',
                NASB95: 'Joseph also went up from Galilee, from the city of Nazareth, to Judea, to the city of David which is called Bethlehem, because he was of the house and family of David,',
                NET: 'So Joseph also went up from the town of Nazareth in Galilee to Judea, to the city of David called Bethlehem, because he was of the house and family line of David.',
                CSB: 'Joseph also went up from the town of Nazareth in Galilee, to Judea, to the city of David, which is called Bethlehem, because he was of the house and family line of David.'
            },
            39: {
                KJV: 'And when they had performed all things according to the law of the Lord, they returned into Galilee, to their own city Nazareth.',
                NIV: 'When Joseph and Mary had done everything required by the Law of the Lord, they returned to Galilee to their own town of Nazareth.',
                ESV: 'And when they had performed everything according to the Law of the Lord, they returned into Galilee, to their own town of Nazareth.',
                NASB95: 'When Joseph and Mary had performed everything according to the Law of the Lord, they returned to Galilee, to their own city of Nazareth.',
                NET: 'So when Joseph and Mary had performed everything according to the law of the Lord, they returned to Galilee, to their own town of Nazareth.',
                CSB: 'When they had completed everything according to the law of the Lord, they returned to Galilee, to their own town of Nazareth.'
            },
            41: {
                KJV: 'Now his parents went to Jerusalem every year at the feast of the passover.',
                NIV: 'Every year Jesus' + String.fromCharCode(39) + ' parents went to Jerusalem for the Festival of the Passover.',
                ESV: 'Now his parents went to Jerusalem every year at the Feast of the Passover.',
                NASB95: 'Now His parents went to Jerusalem every year at the Feast of the Passover.',
                NET: 'Now Jesus' + String.fromCharCode(39) + ' parents went to Jerusalem every year for the feast of the Passover.',
                CSB: 'Every year his parents traveled to Jerusalem for the Passover Festival.'
            }
        };

        // Check for Genesis
        if (ref.book.toLowerCase().includes('genesis')) {
            const chapterTexts = genesisTexts[ref.chapter];
            if (chapterTexts) {
                const verseText = chapterTexts[ref.verse];
                if (verseText) {
                    return [{
                        reference: ref,
                        text: verseText[version],
                        version: version
                    }];
                }
            }
        }

        // Check if this is Luke 2 (our sample verses)
        if (ref.book.toLowerCase().includes('luke') && ref.chapter === 2) {
            const verseText = luke2Texts[ref.verse];
            if (verseText) {
                return [{
                    reference: ref,
                    text: verseText[version],
                    version: version
                }];
            }
        }

        // Default fallback (John 3:16)
        const john316: { [key in BibleVersionId]: string } = {
            'KJV': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
            'NIV': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
            'ESV': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
            'NASB95': 'For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.',
            'NET': 'For this is the way God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
            'CSB': 'For God loved the world in this way: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.'
        };

        return [{
            reference: ref,
            text: john316[version],
            version: version
        }];
    }

    /**
     * Clear all caches (useful for memory management)
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