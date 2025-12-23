import React, { useState } from 'react';
import MapViewer from './components/map/MapViewer';
import MapControls from './components/map/MapControls';
import mapService from './services/mapService';
import { TimePeriod, MapPin } from './types/map';

const App: React.FC = () => {
  // State for map configuration
  const [currentTimePeriod, setCurrentTimePeriod] = useState<TimePeriod>(
    mapService.getDefaultTimePeriod()
  );
  const [transparency, setTransparency] = useState<number>(100);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);

  // Sample pin data for testing
  const samplePins: MapPin[] = [
    {
      id: '1',
      locationName: 'Jerusalem',
      verseReference: 'Luke 2:41-52',
      coordinates: {
        latitude: 31.7683,
        longitude: 35.2137
      },
      description: 'Jesus at the temple as a boy'
    },
    {
      id: '2',
      locationName: 'Bethlehem',
      verseReference: 'Luke 2:4-7',
      coordinates: {
        latitude: 31.7054,
        longitude: 35.2024
      },
      description: 'Birth of Jesus'
    },
    {
      id: '3',
      locationName: 'Nazareth',
      verseReference: 'Luke 2:39',
      coordinates: {
        latitude: 32.7022,
        longitude: 35.2975
      },
      description: 'Where Jesus grew up'
    }
  ];

  // Handler for time period changes
  const handleTimePeriodChange = (period: TimePeriod) => {
    setCurrentTimePeriod(period);
    console.log('Time period changed to:', period.displayName);
  };

  // Handler for transparency changes
  const handleTransparencyChange = (value: number) => {
    setTransparency(value);
  };

  // Handler for pin clicks
  const handlePinClick = (pin: MapPin) => {
    console.log('Pin clicked:', pin.locationName, pin.verseReference);
    // TODO: Open verse reader with the reference
  };

  // Toggle sample pins for testing
  const toggleSamplePins = () => {
    setMapPins(mapPins.length === 0 ? samplePins : []);
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Map Container */}
      <MapViewer
        pins={mapPins}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {mapPins.length === 0 ? 'Show Sample Pins' : 'Hide Sample Pins'}
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
  );
};

export default App;