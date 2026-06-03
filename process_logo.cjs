const Jimp = require('jimp');

async function processLogo() {
    try {
        console.log('Loading logo.png...');
        const image = await Jimp.read('public/logo.png');
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        
        console.log(`Processing image of size ${w}x${h}...`);
        
        // Let's replace white pixels with transparent.
        // We will loop through all pixels. If a pixel is white or very close to white, we make it transparent.
        image.scan(0, 0, w, h, function(x, y, idx) {
            // x, y is the position of this pixel on the image
            // idx is the position start position of this rgba tuple in the bitmap Buffer
            const red   = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue  = this.bitmap.data[idx + 2];
            const alpha = this.bitmap.data[idx + 3];

            // Check if pixel is white (or very close to white)
            // Sometimes borders aren't pure 255, so we use a threshold
            if (red > 240 && green > 240 && blue > 240) {
                // Make the pixel fully transparent
                this.bitmap.data[idx + 3] = 0;
            }
        });

        console.log('Saving transparent logo to public/logo.png...');
        await image.writeAsync('public/logo.png');
        console.log('Success! Logo background is now transparent.');
    } catch (err) {
        console.error('Error processing logo:', err);
    }
}

processLogo();
