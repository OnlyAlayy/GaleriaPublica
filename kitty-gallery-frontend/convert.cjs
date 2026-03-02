const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Tu ruta exacta a la carpeta de las imágenes
const folderPath = "C:\\Users\\Anto\\Desktop\\Maty\\CVS\\GaleriaOnlineSele\\kitty-gallery-frontend\\src\\assets\\Home3D";

console.log("Iniciando magia... 🎀");

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error("No se pudo acceder a la carpeta. Verifica la ruta.", err);
        return;
    }

    // Filtramos solo los archivos PNG
    const pngFiles = files.filter(file => file.endsWith('.png'));

    if (pngFiles.length === 0) {
        console.log("No se encontraron archivos .png en esta carpeta.");
        return;
    }

    console.log(`¡Encontradas ${pngFiles.length} imágenes! Convirtiendo a WebP...`);

    let processed = 0;

    pngFiles.forEach(file => {
        const inputPath = path.join(folderPath, file);
        // Cambiamos la extensión .png por .webp
        const outputPath = path.join(folderPath, file.replace('.png', '.webp'));

        // Convertimos con calidad al 80% (el punto dulce entre nitidez y peso pluma)
        sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath)
            .then(() => {
                processed++;
                if (processed === pngFiles.length) {
                    console.log("✨ ¡Listo! Todas las imágenes fueron convertidas a WebP exitosamente.");
                    console.log("Ya puedes borrar los archivos .png originales para ahorrar espacio.");
                }
            })
            .catch(err => console.error(`Error al convertir ${file}:`, err));
    });
});