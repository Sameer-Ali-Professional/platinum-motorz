// Simple script to create favicon sizes
// Run with: node scripts/create-favicons.js
// Requires: sharp package (npm install sharp)

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const faviconSource = path.join(publicDir, 'favicon.png');

if (!fs.existsSync(faviconSource)) {
  console.error('favicon.png not found in public directory');
  process.exit(1);
}

async function createFavicons() {
  try {
    // Create 32x32 favicon
    await sharp(faviconSource)
      .resize(32, 32)
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Created favicon-32x32.png');

    // Create 48x48 favicon
    await sharp(faviconSource)
      .resize(48, 48)
      .toFile(path.join(publicDir, 'favicon-48x48.png'));
    console.log('✓ Created favicon-48x48.png');

    console.log('\n✅ All favicon sizes created successfully!');
  } catch (error) {
    console.error('Error creating favicons:', error);
    process.exit(1);
  }
}

createFavicons();

