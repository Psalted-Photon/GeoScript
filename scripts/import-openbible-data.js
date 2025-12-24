const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Map Bible book numbers to time periods
function getTimePeriod(verseOsis) {
  if (!verseOsis) return 'mosaic';
  
  const book = verseOsis.split('.')[0];
  const bookToNumber = {
    'Gen': 1, 'Exod': 2, 'Lev': 3, 'Num': 4, 'Deut': 5,
    'Josh': 6, 'Judg': 7, 'Ruth': 8, '1Sam': 9, '2Sam': 10,
    '1Kgs': 11, '2Kgs': 12, '1Chr': 13, '2Chr': 14, 'Ezra': 15,
    'Neh': 16, 'Esth': 17, 'Job': 18, 'Ps': 19, 'Prov': 20,
    'Eccl': 21, 'Song': 22, 'Isa': 23, 'Jer': 24, 'Lam': 25,
    'Ezek': 26, 'Dan': 27, 'Hos': 28, 'Joel': 29, 'Amos': 30,
    'Obad': 31, 'Jonah': 32, 'Mic': 33, 'Nah': 34, 'Hab': 35,
    'Zeph': 36, 'Hag': 37, 'Zech': 38, 'Mal': 39,
    'Matt': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
    'Rom': 45, '1Cor': 46, '2Cor': 47, 'Gal': 48, 'Eph': 49,
    'Phil': 50, 'Col': 51, '1Thess': 52, '2Thess': 53, '1Tim': 54,
    '2Tim': 55, 'Titus': 56, 'Phlm': 57, 'Heb': 58, 'Jas': 59,
    '1Pet': 60, '2Pet': 61, '1John': 62, '2John': 63, '3John': 64,
    'Jude': 65, 'Rev': 66
  };
  
  const bookNum = bookToNumber[book];
  if (!bookNum) return 'mosaic';
  
  if (bookNum <= 11) return 'adamic'; // Genesis - 1 Kings
  if (bookNum <= 14) return 'davidic'; // 2 Kings - 2 Chronicles
  if (bookNum <= 39) return 'ezraitic'; // Ezra - Malachi
  return 'christian'; // All NT
}

// Parse coordinates from lonlat string
function parseCoordinates(lonlat) {
  if (!lonlat) return null;
  const [lon, lat] = lonlat.split(',').map(parseFloat);
  if (isNaN(lat) || isNaN(lon)) return null;
  return { latitude: lat, longitude: lon };
}

async function loadModernLocations() {
  const modernMap = new Map();
  const fileStream = fs.createReadStream(path.join(__dirname, '../openbible-data/data/modern.jsonl'));
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  for await (const line of rl) {
    try {
      const modern = JSON.parse(line);
      if (modern.lonlat) {
        modernMap.set(modern.id, {
          lonlat: modern.lonlat,
          names: modern.names || [],
          precision: modern.precision
        });
      }
    } catch (e) {
      console.error('Error parsing modern location:', e.message);
    }
  }
  
  console.log(`Loaded ${modernMap.size} modern locations`);
  return modernMap;
}

async function processAncientLocations(modernMap, limit = null) {
  const locations = [];
  const fileStream = fs.createReadStream(path.join(__dirname, '../openbible-data/data/ancient.jsonl'));
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let processed = 0;
  let skipped = 0;
  
  for await (const line of rl) {
    if (limit && processed >= limit) break;
    
    try {
      const ancient = JSON.parse(line);
      
      // Skip if no verses
      if (!ancient.verses || ancient.verses.length === 0) {
        skipped++;
        continue;
      }
      
      // Try to get coordinates from identifications first
      let coords = null;
      let bestScore = 0;
      
      if (ancient.identifications && ancient.identifications.length > 0) {
        for (const identification of ancient.identifications) {
          if (identification.resolutions && identification.resolutions.length > 0) {
            for (const resolution of identification.resolutions) {
              if (resolution.lonlat) {
                const parsedCoords = parseCoordinates(resolution.lonlat);
                if (parsedCoords) {
                  const score = identification.score?.vote_total || 0;
                  if (score > bestScore) {
                    coords = parsedCoords;
                    bestScore = score;
                  }
                }
              }
            }
          }
        }
      }
      
      // If no coordinates from identifications, skip this location
      if (!coords) {
        skipped++;
        continue;
      }
      
      // Extract primary name
      const name = ancient.friendly_id || ancient.id;
      
      // Get ALL verse references - comprehensive, no shortcuts
      const relatedVerses = ancient.verses.map(v => v.readable || v.osis);
      
      // Determine time period from first verse
      const timePeriod = ancient.verses[0] ? getTimePeriod(ancient.verses[0].osis) : 'mosaic';
      
      // Determine location type from OpenBible types
      const types = ancient.types || [];
      let locationType = 'settlement'; // default
      if (types.includes('region') || types.includes('people group')) {
        locationType = 'region';
      } else if (types.includes('mountain') || types.includes('mountain range') || types.includes('mountain ridge') || types.includes('hill')) {
        locationType = 'mountain';
      } else if (types.includes('river') || types.includes('wadi') || types.includes('body of water') || types.includes('pool')) {
        locationType = 'water';
      } else if (types.includes('settlement') || types.includes('district in settlement')) {
        locationType = 'settlement';
      } else if (types.includes('natural area') || types.includes('valley') || types.includes('field') || types.includes('garden')) {
        locationType = 'area';
      } else if (types.includes('structure') || types.includes('gate') || types.includes('altar')) {
        locationType = 'structure';
      }
      
      // Build location object
      locations.push({
        id: processed + 1,
        name: name,
        coordinates: coords,
        relatedVerses: relatedVerses,
        timePeriod: timePeriod,
        locationType: locationType,
        metadata: {
          confidence: bestScore,
          verseCount: ancient.verses.length,
          sourceId: ancient.id,
          types: types
        }
      });
      
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`Processed ${processed} locations...`);
      }
      
    } catch (e) {
      console.error('Error parsing ancient location:', e.message);
      skipped++;
    }
  }
  
  console.log(`\nProcessed: ${processed}, Skipped: ${skipped}`);
  return locations;
}

async function main() {
  const args = process.argv.slice(2);
  const limit = args[0] === '--test' ? 50 : null;
  
  console.log('Loading modern locations...');
  const modernMap = await loadModernLocations();
  
  console.log('\nProcessing ancient locations...');
  const locations = await processAncientLocations(modernMap, limit);
  
  const outputPath = path.join(__dirname, '../src/data/locations.json');
  fs.writeFileSync(outputPath, JSON.stringify(locations, null, 2));
  
  console.log(`\n✅ Wrote ${locations.length} locations to ${outputPath}`);
  
  // Show sample
  console.log('\nSample locations:');
  locations.slice(0, 3).forEach(loc => {
    console.log(`  ${loc.name} (${loc.coordinates.latitude}, ${loc.coordinates.longitude})`);
    console.log(`    Verses: ${loc.relatedVerses.slice(0, 2).join(', ')}`);
    console.log(`    Period: ${loc.timePeriod}, Confidence: ${loc.metadata.confidence}`);
  });
}

main().catch(console.error);
