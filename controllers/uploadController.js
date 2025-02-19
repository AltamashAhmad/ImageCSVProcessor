const db = require('../models/db');
const imageProcessingQueue = require('../services/queueService');
const csv = require('csv-parser');
const fs = require('fs');

exports.uploadCSV = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const products = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row['Serial Number'] && row['Product Name'] && row['Input Image Urls']) {
                products.push({
                    serial_number: row['Serial Number'],
                    product_name: row['Product Name'],
                    input_image_urls: row['Input Image Urls']
                });
            }
        })
        .on('end', () => {
            const requestId = `req_${Date.now()}`;
            products.forEach((product) => {
                db.query('INSERT INTO products (serial_number, product_name, input_image_urls) VALUES (?, ?, ?)', 
                [product.serial_number, product.product_name, product.input_image_urls], 
                (err) => {
                    if (err) {
                        console.error('Error inserting product:', err);
                    }
                });

                imageProcessingQueue.add({ product, request_id: requestId });
            });
            console.log('Products inserted successfully');
            db.query('INSERT INTO processing_status (request_id, status) VALUES (?, ?)', 
            [requestId, 'pending'], 
            (err) => {
                if (err) {
                    console.error('Error inserting processing status:', err);

                }
            });
            console.log('Processing status inserted successfully');
            res.status(200).json({ requestId });
        });
}; 