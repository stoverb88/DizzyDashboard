// Script to generate favicon.ico with multiple sizes from SVG
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const svgPath = path.join(__dirname, '..', 'public', 'DDlogobutton.svg');
const appDir = path.join(__dirname, '..', 'app');
const tempDir = path.join(__dirname, '..', 'temp-favicon');

// Sizes for favicon.ico (16x16, 32x32, 48x48)
const faviconSizes = [16, 32, 48];

async function generateFavicon() {
  console.log('Generating favicon.ico with multiple sizes...');

  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Read SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG files for each size
  const pngFiles = [];
  for (const size of faviconSizes) {
    const outputPath = path.join(tempDir, `favicon-${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      pngFiles.push(outputPath);
      console.log(`✓ Generated ${size}x${size} PNG`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  // Convert PNGs to .ico using imagemagick (if available) or use png-to-ico package
  try {
    // Try using ImageMagick first
    const icoPath = path.join(appDir, 'favicon.ico');
    const pngPaths = pngFiles.join(' ');

    await execPromise(`convert ${pngPaths} ${icoPath}`);
    console.log('✓ Created favicon.ico using ImageMagick');

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✓ Cleaned up temp files');

  } catch (error) {
    console.log('ImageMagick not available, using alternative method...');

    // Fallback: Use the largest PNG as favicon (not ideal but works)
    const largest = path.join(tempDir, 'favicon-48.png');
    const icoPath = path.join(appDir, 'favicon.ico');

    // Copy the 48x48 as .ico (browsers will handle it)
    fs.copyFileSync(largest, icoPath);
    console.log('✓ Created favicon.ico from 48x48 PNG');

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('\nFavicon generation complete!');
  console.log('File location: /app/favicon.ico');
  console.log('Refresh your browser to see the updated favicon.');
}

generateFavicon().catch(console.error);
