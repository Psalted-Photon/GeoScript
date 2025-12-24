import React, { useState, useEffect } from 'react';
import MapViewer from './components/map/MapViewer';
import MapControls from './components/map/MapControls';
import VerseReader from './components/bible/VerseReader';
import BibleVersionSelector from './components/bible/BibleVersionSelector';
import ParallelReader from './components/bible/ParallelReader';
import VerseLinkHandler from './components/bible/VerseLinkHandler';
import mapService from './services/mapService';
import bibleService from './services/bibleService';
import { TimePeriod, MapPin } from './types/map';
import { BibleReference, BibleVersionId, DEFAULT_VERSION } from './types/bible';
import { Location } from './types/location';
import locationsData from './data/locations.json';

const App: React.FC = () => {
  // Map state
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(
    mapService.getDefaultTimePeriod()
  );
  const [transparency, setTransparency] = useState<number>(100);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [allPins, setAllPins] = useState<MapPin[]>([]);
  
  // Bible reader state
  const [selectedReference, setSelectedReference] = useState<BibleReference | undefined>(undefined);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersionId>(DEFAULT_VERSION);
  const [interlinearEnabled, setInterlinearEnabled] = useState<boolean>(false);
  const [showParallel, setShowParallel] = useState<boolean>(false);
  const [biblePanelVisible, setBiblePanelVisible] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<MapPin | undefined>(undefined);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | undefined>(undefined);

  // Convert Location data to MapPin format
  const convertLocationToMapPin = (location: Location): MapPin => {
    return {
      id: location.id.toString(),
      locationName: location.name,
      verseReference: location.relatedVerses[0], // Use first verse as primary reference
      coordinates: location.coordinates,
      description: location.description,
      timePeriodId: location.timePeriod || 'christian',
      relatedVerses: location.relatedVerses,
      locationType: location.locationType
    };
  };

  // Load all pins from locations.json on mount
  useEffect(() => {
    const locations = locationsData as Location[];
    const pins = locations.map(convertLocationToMapPin);
    setAllPins(pins);
    setMapPins(pins); // Show all pins by default
  }, []);

  // Filter pins by current time period (or show all if 'all' is selected)
  const visiblePins = currentTimePeriod.id === 'all' 
    ? mapPins 
    : mapPins.filter(pin => 
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
      const bookNumber = bibleService.getBookNumber(book.trim());
      
      if (bookNumber === null) {
        console.error('Invalid book name:', book);
        return;
      }
      
      const reference: BibleReference = {
        book: book.trim(),
        bookNumber: bookNumber,
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
    setMapPins(mapPins.length === 0 ? allPins : []);
  };

  // Handler for location name clicks in Bible text
  const handleLocationClick = (locationName: string) => {
    console.log('Location clicked:', locationName);
    
    // Find the pin with this location name
    const pin = allPins.find(p => p.locationName === locationName);
    
    if (pin) {
      // Center map on the location and select it (highlight on map)
      setMapCenter(pin.coordinates);
      setSelectedPin(pin);
      
      // Do NOT call handlePinClick - keep Bible text where it is
      // User can click the pin itself to see other verses
    } else {
      console.warn('No pin found for location:', locationName);
    }
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
          centerOn={mapCenter}
          zoom={mapCenter ? 10 : undefined}
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
                onReferenceChange={setSelectedReference}
                onLocationClick={handleLocationClick}
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