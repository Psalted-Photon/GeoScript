import React, { useState } from 'react';
import MapViewer from './components/map/MapViewer';
import MapControls from './components/map/MapControls';
import VerseReader from './components/bible/VerseReader';
import BibleVersionSelector from './components/bible/BibleVersionSelector';
import ParallelReader from './components/bible/ParallelReader';
import VerseLinkHandler from './components/bible/VerseLinkHandler';
import mapService from './services/mapService';
import { TimePeriod, MapPin } from './types/map';
import { BibleReference, BibleVersionId, DEFAULT_VERSION } from './types/bible';

const App: React.FC = () => {
  // Map state
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(
    mapService.getDefaultTimePeriod()
  );
  const [transparency, setTransparency] = useState<number>(100);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  
  // Bible reader state
  const [selectedReference, setSelectedReference] = useState<BibleReference | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersionId>(DEFAULT_VERSION);
  const [interlinearEnabled, setInterlinearEnabled] = useState<boolean>(false);
  const [showParallel, setShowParallel] = useState<boolean>(false);
  const [biblePanelVisible, setBiblePanelVisible] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<MapPin | undefined>(undefined);

  // Genesis sample pins for testing
  const genesisPins: MapPin[] = [
    {
      id: 'gen-1',
      locationName: 'Garden of Eden',
      verseReference: 'Genesis 2:8',
      coordinates: {
        latitude: 33.3152,
        longitude: 44.3661
      },
      description: 'Where God placed Adam',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-2',
      locationName: 'Ur of the Chaldees',
      verseReference: 'Genesis 11:31',
      coordinates: {
        latitude: 30.9625,
        longitude: 46.1030
      },
      description: "Abram's birthplace",
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-3',
      locationName: 'Haran',
      verseReference: 'Genesis 11:31',
      coordinates: {
        latitude: 36.8683,
        longitude: 39.0331
      },
      description: "Where Abram's family settled",
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-4',
      locationName: 'Shechem',
      verseReference: 'Genesis 12:6',
      coordinates: {
        latitude: 32.2141,
        longitude: 35.2803
      },
      description: 'First stop in Canaan',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-5',
      locationName: 'Bethel',
      verseReference: 'Genesis 12:8',
      coordinates: {
        latitude: 31.9308,
        longitude: 35.2202
      },
      description: 'Abram built an altar',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-6',
      locationName: 'Egypt',
      verseReference: 'Genesis 12:10',
      coordinates: {
        latitude: 30.0444,
        longitude: 31.2357
      },
      description: 'Abram went due to famine',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-7',
      locationName: 'Mamre (Hebron)',
      verseReference: 'Genesis 13:18',
      coordinates: {
        latitude: 31.5326,
        longitude: 35.0998
      },
      description: 'Abram settled and built altar',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-8',
      locationName: 'Sodom',
      verseReference: 'Genesis 13:12',
      coordinates: {
        latitude: 31.0500,
        longitude: 35.4000
      },
      description: 'Where Lot chose to live',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-9',
      locationName: 'Dan',
      verseReference: 'Genesis 14:14',
      coordinates: {
        latitude: 33.2486,
        longitude: 35.6522
      },
      description: 'Abraham pursued captors',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-10',
      locationName: 'Beersheba',
      verseReference: 'Genesis 21:31',
      coordinates: {
        latitude: 31.2444,
        longitude: 34.7925
      },
      description: 'Abraham made covenant with Abimelech',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-11',
      locationName: 'Mount Moriah',
      verseReference: 'Genesis 22:2',
      coordinates: {
        latitude: 31.7780,
        longitude: 35.2354
      },
      description: 'Abraham offered Isaac',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-12',
      locationName: 'Bethel',
      verseReference: 'Genesis 28:19',
      coordinates: {
        latitude: 31.9308,
        longitude: 35.2202
      },
      description: "Jacob's ladder vision",
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-13',
      locationName: 'Paddan Aram',
      verseReference: 'Genesis 28:5',
      coordinates: {
        latitude: 36.8683,
        longitude: 39.0331
      },
      description: 'Jacob fled to Laban',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-14',
      locationName: 'Peniel',
      verseReference: 'Genesis 32:30',
      coordinates: {
        latitude: 32.2158,
        longitude: 35.6519
      },
      description: 'Jacob wrestled with God',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-15',
      locationName: 'Dothan',
      verseReference: 'Genesis 37:17',
      coordinates: {
        latitude: 32.4097,
        longitude: 35.3178
      },
      description: 'Joseph sold by his brothers',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-16',
      locationName: 'Goshen',
      verseReference: 'Genesis 47:6',
      coordinates: {
        latitude: 30.8333,
        longitude: 31.4167
      },
      description: "Jacob's family settled in Egypt",
      timePeriodId: 'patriarchs'
    }
  ];

  // Luke sample pins for testing
  const lukePins: MapPin[] = [
    {
      id: '1',
      locationName: 'Jerusalem',
      verseReference: 'Luke 2:41',
      coordinates: {
        latitude: 31.7683,
        longitude: 35.2137
      },
      description: 'Jesus at the temple as a boy',
      timePeriodId: 'jesus-ministry'
    },
    {
      id: '2',
      locationName: 'Bethlehem',
      verseReference: 'Luke 2:4',
      coordinates: {
        latitude: 31.7054,
        longitude: 35.2024
      },
      description: 'Birth of Jesus',
      timePeriodId: 'jesus-ministry'
    },
    {
      id: '3',
      locationName: 'Nazareth',
      verseReference: 'Luke 2:39',
      coordinates: {
        latitude: 32.7022,
        longitude: 35.2975
      },
      description: 'Where Jesus grew up',
      timePeriodId: 'jesus-ministry'
    }
  ];

  // Combine all sample pins
  const allSamplePins: MapPin[] = [...genesisPins, ...lukePins];

  // Filter pins by current time period
  const visiblePins = mapPins.filter(pin => 
    !pin.timePeriodId || pin.timePeriodId === currentTimePeriod.id
  );

  // Handler for time period changes
  const handleTimePeriodChange = (period: TimePeriod) => {
    setCurrentTimePeriod(period);
  };

  // Handler for transparency changes
  const handleTransparencyChange = (value: number) => {
    setTransparency(value);
  };

  // Handler for pin clicks - show Bible text
  const handlePinClick = (pin: MapPin) => {
    console.log('Pin clicked:', pin.locationName, pin.verseReference);
    
    // Store the selected pin
    setSelectedPin(pin);
    
    // Parse the verse reference
    const match = pin.verseReference.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (match) {
      const [, book, chapter, verse, endVerse] = match;
      const reference: BibleReference = {
        book: book.trim(),
        bookNumber: 1, // Simplified
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        endVerse: endVerse ? parseInt(endVerse) : undefined
      };
      
      setSelectedReference(reference);
      setBiblePanelVisible(true);
    }
  };

  // Toggle sample pins for testing
  const toggleSamplePins = () => {
    setMapPins(mapPins.length === 0 ? allSamplePins : []);
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex'
    }}>
      {/* Map Container */}
      <div style={{ 
        flex: biblePanelVisible ? '1 1 60%' : '1 1 100%',
        position: 'relative',
        transition: 'flex 0.3s ease'
      }}>
        <MapViewer
          pins={visiblePins}
          currentTimePeriod={currentTimePeriod}
          transparency={transparency}
          onPinClick={handlePinClick}
          selectedPinId={selectedPin?.id}
        />

        {/* Map Controls Overlay */}
        <MapControls
          currentTimePeriod={currentTimePeriod}
          transparency={transparency}
          onTimePeriodChange={handleTimePeriodChange}
          onTransparencyChange={handleTransparencyChange}
          position="top-right"
        />

        {/* Test Button - Bottom Left */}
        <div style={{
          position: 'absolute',
          bottom: window.innerWidth < 768 ? '100px' : '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: '10px'
        }}>
          <button
            onClick={toggleSamplePins}
            style={{
              padding: window.innerWidth < 768 ? '12px 16px' : '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: window.innerWidth < 768 ? '16px' : '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              minWidth: window.innerWidth < 768 ? '140px' : 'auto'
            }}
          >
            {mapPins.length === 0 ? 'Show Pins' : 'Hide Pins'}
          </button>
          
          <button
            onClick={() => setBiblePanelVisible(!biblePanelVisible)}
            style={{
              padding: window.innerWidth < 768 ? '12px 16px' : '10px 20px',
              backgroundColor: biblePanelVisible ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: window.innerWidth < 768 ? '16px' : '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              minWidth: window.innerWidth < 768 ? '140px' : 'auto'
            }}
          >
            {biblePanelVisible ? 'Hide Bible' : 'Show Bible'}
          </button>
        </div>

        {/* App Title - Top Left */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            letterSpacing: '-0.5px'
          }}>
            GeoScript
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '11px',
            color: '#6b7280'
          }}>
            Interactive Biblical Geography
          </p>
        </div>
      </div>

      {/* Bible Reader Panel */}
      {biblePanelVisible && (
        <div style={{
          flex: '1 1 40%',
          backgroundColor: 'white',
          borderLeft: '2px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxWidth: '600px'
        }}>
          {/* Location Header - Shows which pin was clicked */}
          {selectedPin && (
            <div style={{
              padding: '15px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderBottom: '2px solid #2563eb'
            }}>
              <h2 style={{
                margin: '0 0 5px 0',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                📍 {selectedPin.locationName}
              </h2>
              {selectedPin.description && (
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  opacity: 0.95
                }}>
                  {selectedPin.description}
                </p>
              )}
            </div>
          )}
          
          {/* Bible Controls Header */}
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <BibleVersionSelector
              selectedVersion={selectedVersion}
              onVersionChange={setSelectedVersion}
              showInterlinearToggle={true}
              interlinearEnabled={interlinearEnabled}
              onInterlinearToggle={setInterlinearEnabled}
            />
            
            <div style={{
              marginTop: '10px',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowParallel(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: showParallel ? '400' : '600',
                  backgroundColor: showParallel ? '#f3f4f6' : '#3b82f6',
                  color: showParallel ? '#6b7280' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Single Version
              </button>
              <button
                onClick={() => setShowParallel(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '13px',
                  fontWeight: showParallel ? '600' : '400',
                  backgroundColor: showParallel ? '#3b82f6' : '#f3f4f6',
                  color: showParallel ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Parallel View
              </button>
            </div>
          </div>

          {/* Bible Text Display */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'white'
          }}>
            {showParallel ? (
              <ParallelReader
                reference={selectedReference}
                versions={['KJV', 'NIV', 'ESV']}
                onVerseClick={setSelectedReference}
              />
            ) : (
              <VerseReader
                reference={selectedReference}
                version={selectedVersion}
                showInterlinear={interlinearEnabled}
                onVerseClick={setSelectedReference}
              />
            )}
          </div>
        </div>
      )}

      {/* Verse Link Handler (invisible) */}
      <VerseLinkHandler
        mapPins={mapPins}
        selectedReference={selectedReference}
        onReferenceSelect={setSelectedReference}
      />
    </div>
  );
};

export default App;