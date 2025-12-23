# GeoScript - Interactive Biblical Geography

<div align="center">

**An immersive Bible study tool combining Scripture with historical maps and interactive geography**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green.svg)](https://leafletjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)

</div>

## 🌍 Overview

GeoScript bridges the gap between biblical text and geography by providing an interactive map-based Bible study experience. No more flipping to the back of your Bible to find locations—verses and maps are dynamically linked in real-time.

### Current Features (Phase 1 Complete ✅)

- **📍 Interactive Leaflet Map**: Smooth, zoomable map with OpenStreetMap base layer
- **⏳ Historical Time Periods**: Switch between 7 biblical eras (Patriarchs, Exodus, United/Divided Kingdom, Jesus' Ministry, Paul's Journeys, Early Church)
- **🎚️ Transparency Control**: Blend map layers with customizable opacity (0-100%)
- **📌 Location Pins**: Clickable markers with verse references and contextual information
- **🗺️ Sample Data**: Pre-loaded pins for Jerusalem, Bethlehem, and Nazareth to test functionality

### Planned Features (Coming Soon)

- **📖 Multi-Version Bible Reader**: KJV, NIV, NET, NASB, ESV, CSB support
- **🔤 Hebrew/Greek Interlinears**: Toggle Strong's numbers and original language display
- **🎬 Animated Journeys**: Watch biblical journeys unfold across the map
- **📚 Story Mode**: Guided narratives with synchronized map movement
- **🔍 Location Search**: Find any biblical location instantly
- **↔️ Parallel Reading**: Split-screen Bible text + map with auto-sync
- **🏔️ 3D Terrain** (Future): Visualize elevation and understand geographical context

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Psalted-Photon/GeoScript.git

# Navigate to project directory
cd GeoScript

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Testing the Map

1. **Switch Time Periods**: Use the dropdown in the top-right to select different historical eras
2. **Adjust Transparency**: Slide the opacity control to blend the map layer
3. **Toggle Sample Pins**: Click the blue button in the bottom-left to show/hide location markers
4. **Click Pins**: Click any pin to see verse references and descriptions

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

Your app will be live at `https://psalted-photon.github.io/GeoScript/`

## 🗂️ Project Structure

```
GeoScript/
├── public/
│   ├── tiles/              # Historical map tile pyramids (see tiles/README.md)
│   └── index.html
├── src/
│   ├── components/
│   │   ├── map/           # Map components (MapViewer, Controls, Layers)
│   │   ├── bible/         # Bible reading components (future)
│   │   ├── journeys/      # Journey animations (future)
│   │   └── ui/            # Shared UI components
│   ├── data/
│   │   ├── timePeriods.json    # Historical era definitions
│   │   ├── locations.json      # Biblical locations database
│   │   └── journeys.json       # Journey path data
│   ├── services/
│   │   ├── mapService.ts       # Map utilities and configuration
│   │   └── bibleService.ts     # Bible API integration (future)
│   ├── types/             # TypeScript type definitions
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Entry point
└── package.json
```

## 🗺️ Adding Historical Maps

See [`public/tiles/README.md`](public/tiles/README.md) for detailed instructions on:

- Converting high-resolution historical maps to tile pyramids
- Using GDAL or MapTiler for georeferencing
- Free biblical map sources (David Rumsey Collection, Library of Congress)
- Performance optimization tips

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Mapping**: Leaflet 1.9.4 + React-Leaflet 4.2
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Build Tool**: Create React App 5.0
- **Deployment**: GitHub Pages
- **Future Bible API**: BibleAPI.com, STEPBible for interlinears

## 📝 Development Roadmap

### Phase 1: Map Foundation ✅ (Complete)
- [x] Leaflet map integration
- [x] Time period layer system
- [x] Transparency controls
- [x] Pin markers with popups
- [x] GitHub Pages deployment setup

### Phase 2: Bible Integration (Next)
- [ ] Integrate BibleAPI.com or similar API
- [ ] Implement verse reader component
- [ ] Add multi-version support (KJV, NIV, NET, NASB, ESV, CSB)
- [ ] Hebrew/Greek interlinear toggle
- [ ] Strong's number lookups
- [ ] Verse-to-location automatic linking

### Phase 3: Advanced Features
- [ ] Journey animation system
- [ ] Story mode with guided narratives
- [ ] Parallel reading with map sync
- [ ] Location search with autocomplete
- [ ] User notes and highlights (localStorage)
- [ ] 3D terrain visualization

### Phase 4: Performance & Polish
- [ ] IndexedDB caching for Bible text
- [ ] Virtual scrolling for large text
- [ ] Progressive Web App (PWA) support
- [ ] Offline mode
- [ ] Mobile responsiveness improvements

## 🤝 Contributing

Contributions are welcome! Whether you're:

- Adding historical maps
- Improving UI/UX
- Fixing bugs
- Adding Bible translations
- Writing documentation

Please fork the repository and submit a pull request.

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- OpenStreetMap contributors for base map tiles
- Leaflet.js for the mapping library
- Bible API providers (BibleAPI.com, ESV API)
- STEPBible for Hebrew/Greek tagged texts
- David Rumsey Map Collection for historical maps

---

<div align="center">

**Built with ❤️ for Bible study and biblical geography exploration**

[Report Bug](https://github.com/Psalted-Photon/GeoScript/issues) · [Request Feature](https://github.com/Psalted-Photon/GeoScript/issues)

</div>