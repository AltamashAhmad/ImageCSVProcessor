const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/webhook', express.json(), webhookController.processWebhook);

module.exports = router; 