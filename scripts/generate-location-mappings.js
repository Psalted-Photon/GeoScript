const fs = require('fs');
const path = require('path');

// Load locations
const locations = require('../src/data/locations.json');

// Generate variants for location names
function generateVariants(name) {
  const variants = [name];
  
  // Add version without numbers (e.g., "Achzib 1" -> "Achzib")
  const withoutNumber = name.replace(/\s+\d+$/, '');
  if (withoutNumber !== name && !variants.includes(withoutNumber)) {
    variants.push(withoutNumber);
  }
  
  // Add version with "the" prefix
  if (!name.startsWith('the ') && !name.startsWith('The ')) {
    variants.push(`the ${name}`);
  }
  
  // Handle hyphenated names - add variant with spaces
  if (name.includes('-')) {
    const withSpaces = name.replace(/-/g, ' ');
    if (!variants.includes(withSpaces)) {
      variants.push(withSpaces);
    }
  }
  
  // Handle "Mount" / "Mt" / "Mt." variations
  if (name.startsWith('Mount ')) {
    variants.push(name.replace('Mount ', 'Mt. '));
    variants.push(name.replace('Mount ', 'Mt '));
    variants.push(name.replace('Mount ', 'mount '));
  }
  
  // Handle "City of" variations
  if (name.includes(' of ')) {
    const withoutOf = name.replace(/ of .*/, '');
    if (withoutOf && !variants.includes(withoutOf)) {
      variants.push(withoutOf);
    }
  }
  
  return variants;
}

// Build mappings
const mappings = locations.map(loc => {
  const variants = generateVariants(loc.name);
  return {
    canonical: loc.name,
    variants: variants
  };
});

// Generate TypeScript code
const functionCode = [
  'export function findLocationsInText(text: string): LocationMatch[] {',
  '  const matches: LocationMatch[] = [];',
  '  const allVariants: Array<{ variant: string; canonical: string }> = [];',
  '  ',
  '  // Build flat list of all variants',
  '  for (const mapping of LOCATION_MAPPINGS) {',
  '    for (const variant of mapping.variants) {',
  '      allVariants.push({ variant, canonical: mapping.canonical });',
  '    }',
  '  }',
  '  ',
  '  // Sort by length (longest first) to match longest names first',
  '  allVariants.sort((a, b) => b.variant.length - a.variant.length);',
  '  ',
  '  // Find matches',
  '  for (const { variant, canonical } of allVariants) {',
  '    const escapedVariant = variant.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g, \'\\\\\\\\$&\');',
  '    const pattern = \'\\\\b\' + escapedVariant + \'\\\\b\';',
  '    const regex = new RegExp(pattern, \'gi\');',
  '    let match;',
  '    ',
  '    while ((match = regex.exec(text)) !== null) {',
  '      const startIndex = match.index;',
  '      const endIndex = startIndex + match[0].length;',
  '      ',
  '      // Check for overlap with existing matches',
  '      const hasOverlap = matches.some(m => ',
  '        (startIndex >= m.startIndex && startIndex < m.endIndex) ||',
  '        (endIndex > m.startIndex && endIndex <= m.endIndex)',
  '      );',
  '      ',
  '      if (!hasOverlap) {',
  '        matches.push({',
  '          text: match[0],',
  '          canonical,',
  '          startIndex,',
  '          endIndex',
  '        });',
  '      }',
  '    }',
  '  }',
  '  ',
  '  // Sort by position in text',
  '  return matches.sort((a, b) => a.startIndex - b.startIndex);',
  '}'
].join('\n');

const tsCode = `// Auto-generated location mappings from OpenBible.info dataset
// Generated: ${new Date().toISOString()}
// Total locations: ${mappings.length}

export interface LocationVariant {
  canonical: string;
  variants: string[];
}

export const LOCATION_MAPPINGS: LocationVariant[] = ${JSON.stringify(mappings, null, 2)};

export function normalizeLocationName(text: string): string | null {
  const normalized = text.trim();
  for (const mapping of LOCATION_MAPPINGS) {
    if (mapping.variants.some(v => v.toLowerCase() === normalized.toLowerCase())) {
      return mapping.canonical;
    }
  }
  return null;
}

export interface LocationMatch {
  text: string;
  canonical: string;
  startIndex: number;
  endIndex: number;
}

${functionCode}
`;

// Write output
const outputPath = path.join(__dirname, '../src/utils/locationParser.ts');
fs.writeFileSync(outputPath, tsCode);

console.log(`✅ Generated ${mappings.length} location mappings`);
console.log(`📝 Written to: ${outputPath}`);
console.log(`\nSample mappings:`);
mappings.slice(0, 5).forEach(m => {
  console.log(`  ${m.canonical}: [${m.variants.join(', ')}]`);
});
