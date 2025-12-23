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
      verseReference: 'Genesis 12:1',
      coordinates: {
        latitude: 30.9625,
        longitude: 46.1030
      },
      description: 'God calls Abram to leave',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-3',
      locationName: 'Shechem',
      verseReference: 'Genesis 12:7',
      coordinates: {
        latitude: 32.2141,
        longitude: 35.2803
      },
      description: 'First altar in Canaan',
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-4',
      locationName: 'Bethel',
      verseReference: 'Genesis 28:12',
      coordinates: {
        latitude: 31.9308,
        longitude: 35.2202
      },
      description: "Jacob's ladder vision",
      timePeriodId: 'patriarchs'
    },
    {
      id: 'gen-5',
      locationName: 'Peniel',
      verseReference: 'Genesis 32:28',
      coordinates: {
        latitude: 32.2158,
        longitude: 35.6519
      },
      description: 'Jacob renamed Israel',
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
          bottom: '20px',
          left: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={toggleSamplePins}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              marginRight: '10px'
            }}
          >
            {mapPins.length === 0 ? 'Show Sample Pins' : 'Hide Sample Pins'}
          </button>
          
          <button
            onClick={() => setBiblePanelVisible(!biblePanelVisible)}
            style={{
              padding: '10px 20px',
              backgroundColor: biblePanelVisible ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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