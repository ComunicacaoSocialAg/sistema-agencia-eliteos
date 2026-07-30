import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function convert() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Read the JPEG as base64
  const jpegPath = '/Users/bruno/Documents/anti/public/ing-picles.jpg';
  const jpegBuffer = fs.readFileSync(jpegPath);
  const jpegBase64 = jpegBuffer.toString('base64');
  
  console.log('Processing pickle image via headless browser canvas...');
  
  const resultBase64 = await page.evaluate(async (base64) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Loop through pixels and make black/dark pixels transparent
        // Since JPEG has compression artifacts, we check if RGB are all below a threshold (e.g. 35)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // If the pixel is very dark (black background)
          if (r < 40 && g < 40 && b < 40) {
            data[i+3] = 0; // Set alpha to 0 (transparent)
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = 'data:image/jpeg;base64,' + base64;
    });
  }, jpegBase64);
  
  // Write the resulting PNG
  const pngBase64 = resultBase64.replace(/^data:image\/png;base64,/, '');
  const pngPath = '/Users/bruno/Documents/anti/public/ing-picles.png';
  fs.writeFileSync(pngPath, Buffer.from(pngBase64, 'base64'));
  console.log(`Success! Saved transparent PNG to ${pngPath}`);
  
  await browser.close();
}

convert().catch(console.error);
