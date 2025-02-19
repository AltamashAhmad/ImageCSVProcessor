const sharp = require('sharp');
const path = require('path');

exports.processImage = async (buffer, url) => {
    const fileName = path.basename(url);
    const outputPath = path.join('outputs', fileName);
    await sharp(buffer)
        .jpeg({ quality: 50 })
        .toFile(path.join(__dirname, '..', outputPath));
    return outputPath;
}; 