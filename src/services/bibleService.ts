import { BibleVerse } from '../types/bible';

class BibleService {
    private verses: BibleVerse[];

    constructor() {
        this.verses = [];
    }

    async loadVerses(): Promise<void> {
        const response = await fetch('/path/to/bible/verses.json');
        this.verses = await response.json();
    }

    getVerse(reference: string): BibleVerse | undefined {
        return this.verses.find(verse => verse.reference === reference);
    }

    searchVerses(query: string): BibleVerse[] {
        return this.verses.filter(verse => 
            verse.text.toLowerCase().includes(query.toLowerCase())
        );
    }

    getAllVerses(): BibleVerse[] {
        return this.verses;
    }
}

export default new BibleService();