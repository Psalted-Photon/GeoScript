# Historical Map Tiles Directory

This directory will contain tile pyramids for historical biblical maps organized by time period.

## Directory Structure

```
tiles/
├── patriarchs/          # 2000-1500 BC
│   ├── {z}/
│   │   ├── {x}/
│   │   │   └── {y}.png
├── exodus/              # 1446-1406 BC
├── united-kingdom/      # 1050-931 BC
├── divided-kingdom/     # 931-586 BC
├── jesus-ministry/      # 27-30 AD
├── pauls-journeys/      # 46-67 AD
└── early-church/        # 30-100 AD
```

## How to Generate Tile Pyramids

### Using GDAL (Recommended)

1. **Install GDAL** (if not already installed):
   - Windows: Download from https://gdal.org/download.html
   - Mac: `brew install gdal`
   - Linux: `sudo apt-get install gdal-bin`

2. **Georeference Your Map** (if not already georeferenced):
   Use QGIS or another GIS tool to add ground control points that match
   known locations on your historical map to modern coordinates.

3. **Generate Tiles**:
   ```bash
   gdal2tiles.py --zoom=5-10 --processes=4 \
     your-map.tif tiles/jesus-ministry/
   ```

### Using MapTiler (Easier, GUI-based)

1. Download MapTiler from https://www.maptiler.com/
2. Import your georeferenced historical map
3. Select "Mercator" projection
4. Export as "Folder with tiles" (XYZ format)
5. Copy generated tiles to appropriate directory

## Tile Requirements

- **Format**: PNG with transparency support
- **Projection**: Web Mercator (EPSG:3857)
- **Zoom Levels**: 5-10 recommended (adjust per map detail)
- **Naming**: Standard XYZ format: `{z}/{x}/{y}.png`

## Free Historical Map Sources

1. **David Rumsey Map Collection** (public domain)
   - https://www.davidrumsey.com/
   - Search for "biblical" or "Palestine" maps

2. **Old Maps Online**
   - https://www.oldmapsonline.org/

3. **Library of Congress**
   - https://www.loc.gov/maps/

4. **Wikimedia Commons**
   - https://commons.wikimedia.org/
   - Search for "biblical geography maps"

## Performance Tips

- Keep tile file sizes under 50KB each
- Use PNG compression
- Consider creating multiple zoom level ranges for different map scales
- Test tile loading locally before deploying to GitHub Pages

## Fallback Behavior

If historical tiles are not available, the app automatically falls back to 
OpenStreetMap base layer. You can start with just OSM and add historical 
layers incrementally.
