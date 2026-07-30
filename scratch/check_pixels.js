import fs from 'fs';

function checkPNG(filepath) {
  try {
    const buffer = fs.readFileSync(filepath);
    console.log(`Checking ${filepath}...`);
    console.log(`File size: ${buffer.length} bytes`);
    
    // PNG signature check
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      console.log('Valid PNG signature.');
    } else {
      console.log('Not a valid PNG signature.');
      return;
    }

    // Let's find the IHDR chunk to see the color type
    // IHDR starts at byte 12 (length is 4 bytes, 'IHDR' is 4 bytes)
    const colorType = buffer[25];
    console.log(`Color type byte: ${colorType}`);
    if (colorType === 6) {
      console.log('Color type 6: Truecolor with Alpha channel (RGBA) -> Background is likely transparent!');
    } else if (colorType === 2) {
      console.log('Color type 2: Truecolor without Alpha (RGB) -> Background is solid!');
    } else if (colorType === 3) {
      console.log('Color type 3: Indexed color (PLTE) -> Might have transparency chunk (tRNS).');
    } else {
      console.log(`Other color type: ${colorType}`);
    }
  } catch (err) {
    console.error(`Error reading ${filepath}:`, err.message);
  }
}

checkPNG('/Users/bruno/Documents/anti/public/ing-cebola.png');
checkPNG('/Users/bruno/Documents/anti/public/ing-pimenta.png');
