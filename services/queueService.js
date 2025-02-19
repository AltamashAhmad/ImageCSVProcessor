const Queue = require('bull');
const fetchImage = require('../utils/fetchImage');
const imageService = require('./imageService');
const db = require('../models/db');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const imageProcessingQueue = new Queue('image-processing', {
    redis: { host: '127.0.0.1', port: 6379 }
});

imageProcessingQueue.process(async (job) => {
    const { product, request_id } = job.data;
    const inputUrls = product.input_image_urls.split(',');
    const outputUrls = [];

    for (const url of inputUrls) {
        const buffer = await fetchImage(url);
        if (buffer) {
            try {
                const outputPath = await imageService.processImage(buffer, url);
                outputUrls.push(outputPath);
            } catch (error) {
                console.error('Error processing image:', error.message);
            }
        }
    }

    // Generate output CSV
    const outputCsvData = [{
        serial_number: product.serial_number,
        product_name: product.product_name,
        input_image_urls: product.input_image_urls,
        output_image_urls: outputUrls.join(',')
    }];

    const csvParser = new Parser();
    const csv = csvParser.parse(outputCsvData);
    const outputCsvPath = path.join(__dirname, '..', 'outputs', `${request_id}.csv`);

    fs.writeFileSync(outputCsvPath, csv);

    console.log(`Output CSV generated at: ${outputCsvPath}`);

    console.log(`Updating database for request_id: ${request_id}`);
    console.log(`Output URLs: ${outputUrls.join(',')}`);
    db.query('UPDATE processing_status SET status = ?, output_image_urls = ? WHERE request_id = ?', 
    ['completed', outputUrls.join(','), request_id], 
    (err) => {
        if (err) {
            console.error('Error updating processing status:', err);
        }
    });
});

module.exports = imageProcessingQueue; 