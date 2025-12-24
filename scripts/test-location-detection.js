const { findLocationsInText } = require('../src/utils/locationParser.ts');

// Test passages with known locations
const testCases = [
  {
    name: "Genesis 11 - Tower of Babel",
    text: "Now the whole earth had one language and the same words. And as people migrated from the east, they found a plain in the land of Shinar and settled there."
  },
  {
    name: "Genesis 12 - Abraham's journey",
    text: "Now the Lord said to Abram, 'Go from your country and your kindred and your father's house to the land that I will show you. And Abram journeyed on, still going toward the Negeb. Now there was a famine in the land. So Abram went down to Egypt to sojourn there.'"
  },
  {
    name: "John 1 - Multiple locations",
    text: "The next day Jesus decided to go to Galilee. He found Philip and said to him, 'Follow me.' Now Philip was from Bethsaida, the city of Andrew and Peter. Philip found Nathanael and said to him, 'We have found him of whom Moses in the Law and also the prophets wrote, Jesus of Nazareth, the son of Joseph.'"
  },
  {
    name: "Acts 2 - Pentecost locations",
    text: "And there were dwelling in Jerusalem Jews, devout men, from every nation under heaven. Parthians and Medes and Elamites and residents of Mesopotamia, Judea and Cappadocia, Pontus and Asia, Phrygia and Pamphylia, Egypt and the parts of Libya belonging to Cyrene, and visitors from Rome."
  }
];

console.log('Testing location detection with 1,276 locations...\n');

testCases.forEach(test => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${test.name}`);
  console.log('='.repeat(60));
  console.log(`Text: ${test.text.substring(0, 100)}...`);
  
  const matches = findLocationsInText(test.text);
  
  if (matches.length > 0) {
    console.log(`\n✅ Found ${matches.length} location(s):`);
    matches.forEach(match => {
      console.log(`   - "${match.text}" → ${match.canonical}`);
    });
  } else {
    console.log('\n❌ No locations found');
  }
});

console.log('\n' + '='.repeat(60));
console.log('Test complete!');
