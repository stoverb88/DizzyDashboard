// Script to generate PNG icons from SVG for favicon and PWA
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'DDlogobutton.svg');
const appDir = path.join(__dirname, '..', 'app');

// Icon sizes to generate
const icons = [
  { name: 'icon.png', size: 192 },           // PWA standard icon
  { name: 'apple-icon.png', size: 180 },     // Apple touch icon
  { name: 'icon-512.png', size: 512 },       // PWA large icon
];

async function generateIcons() {
  console.log('Generating icons from SVG...');

  // Read SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate each icon size
  for (const icon of icons) {
    const outputPath = path.join(appDir, icon.name);

    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.name}:`, error.message);
    }
  }

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
