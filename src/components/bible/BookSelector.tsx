import React, { useState } from 'react';
import { BibleReference } from '../../types/bible';

interface BibleBook {
    name: string;
    number: number;
    chapters: number;
}

// All 66 books of the Bible with chapter counts
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

interface BookSelectorProps {
    onBookSelect: (reference: BibleReference) => void;
    onClose: () => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({ onBookSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBooks = BIBLE_BOOKS.filter(book =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBookClick = (book: BibleBook) => {
        const reference: BibleReference = {
            book: book.name,
            bookNumber: book.number,
            chapter: 1,
            verse: 1
        };
        onBookSelect(reference);
        onClose();
    };

    // Group books by testament
    const oldTestament = filteredBooks.filter(b => b.number <= 39);
    const newTestament = filteredBooks.filter(b => b.number >= 40);

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    maxWidth: '800px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Select a Book</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px 8px'
                        }}
                    >
                        ×
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        marginBottom: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                    autoFocus
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Old Testament */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#666' }}>
                            Old Testament ({oldTestament.length} books)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {oldTestament.map(book => (
                                <button
                                    key={book.number}
                                    onClick={() => handleBookClick(book)}
                                    style={{
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    <div style={{ fontWeight: '500' }}>{book.name}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{book.chapters} chapters</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* New Testament */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#666' }}>
                            New Testament ({newTestament.length} books)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {newTestament.map(book => (
                                <button
                                    key={book.number}
                                    onClick={() => handleBookClick(book)}
                                    style={{
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    <div style={{ fontWeight: '500' }}>{book.name}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{book.chapters} chapters</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookSelector;
