const db = require('../models/db');

exports.processWebhook = (req, res) => {
    const { requestId, status, output_image_urls } = req.body;
    const outputUrls = Array.isArray(output_image_urls) ? output_image_urls : output_image_urls.split(',');

    db.query('UPDATE processing_status SET status = ?, output_image_urls = ? WHERE request_id = ?', 
    [status, outputUrls.join(','), requestId], 
    (err) => {
        if (err) {
            console.error('Error updating processing status via webhook:', err);
            return res.status(500).send('Internal server error.');
        }
        console.log(`Processing status updated via webhook for request_id: ${requestId}`);
        res.status(200).send('Webhook processed successfully.');
    });
}; 