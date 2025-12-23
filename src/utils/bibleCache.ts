import { BibleVerse, BibleVersionId } from '../types/bible';

/**
 * IndexedDB wrapper for Bible verse caching
 * Provides fast offline access to previously fetched verses
 */
class BibleCache {
    private dbName = 'BibleCacheDB';
    private storeName = 'verses';
    private version = 1;
    private db: IDBDatabase | null = null;

    /**
     * Initialize IndexedDB connection
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'cacheKey' });
                    objectStore.createIndex('version', 'version', { unique: false });
                    objectStore.createIndex('book', 'book', { unique: false });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Store verses in cache
     */
    async set(
        cacheKey: string,
        verses: BibleVerse[],
        version: BibleVersionId,
        book: string
    ): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const data = {
                cacheKey,
                verses,
                version,
                book,
                timestamp: Date.now()
            };

            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieve verses from cache
     */
    async get(cacheKey: string): Promise<BibleVerse[] | null> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(cacheKey);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    // Check if cache is older than 7 days
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
                    if (Date.now() - result.timestamp > maxAge) {
                        // Cache expired, return null
                        this.delete(cacheKey);
                        resolve(null);
                    } else {
                        resolve(result.verses);
                    }
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Check if verses are cached
     */
    async has(cacheKey: string): Promise<boolean> {
        const verses = await this.get(cacheKey);
        return verses !== null;
    }

    /**
     * Delete specific cache entry
     */
    async delete(cacheKey: string): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(cacheKey);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cached verses
     */
    async clear(): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        totalEntries: number;
        oldestEntry: number | null;
        newestEntry: number | null;
        sizeEstimate: number;
    }> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const entries = request.result;
                const timestamps = entries.map(e => e.timestamp);
                
                resolve({
                    totalEntries: entries.length,
                    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
                    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
                    sizeEstimate: JSON.stringify(entries).length
                });
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove old cache entries to free space
     */
    async pruneOldEntries(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const request = index.openCursor();

            let deletedCount = 0;
            const cutoffTime = Date.now() - maxAgeMs;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    if (cursor.value.timestamp < cutoffTime) {
                        cursor.delete();
                        deletedCount++;
                    }
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }
}

export default new BibleCache();
