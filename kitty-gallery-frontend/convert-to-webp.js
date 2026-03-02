const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "src", "assets", "Home3D");
const outputDir = inputDir; // same directory

const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".png") && f.startsWith("ezgif-frame-"));

console.log(`Found ${files.length} PNG frames. Converting to WebP at 80% quality...`);

(async () => {
    let done = 0;
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace(".png", ".webp"));

        await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);

        done++;
        if (done % 20 === 0 || done === files.length) {
            console.log(`  ${done}/${files.length} converted`);
        }
    }

    // Report size savings
    let pngTotal = 0, webpTotal = 0;
    for (const file of files) {
        pngTotal += fs.statSync(path.join(inputDir, file)).size;
        webpTotal += fs.statSync(path.join(outputDir, file.replace(".png", ".webp"))).size;
    }

    console.log(`\nDone!`);
    console.log(`PNG total:  ${(pngTotal / 1024 / 1024).toFixed(1)} MB`);
    console.log(`WebP total: ${(webpTotal / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Savings:    ${(100 - (webpTotal / pngTotal) * 100).toFixed(1)}%`);
})();
