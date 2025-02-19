const db = require('../models/db');

exports.checkStatus = (req, res) => {
    const requestId = req.params.requestId;
    
    db.query('SELECT status, output_image_urls FROM processing_status WHERE request_id = ?', [requestId], (err, results) => {
        if (err) {
            console.error('Error querying status:', err);
            return res.status(500).send('Internal server error.');
        }

        if (results.length === 0) {
            return res.status(404).send('Request ID not found.');
        }

        const { status, output_image_urls } = results[0];
        res.status(200).json({ status, output_image_urls });
        console.log('Status checked successfully:', status, output_image_urls);
    });
}; 