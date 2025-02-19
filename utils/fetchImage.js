const axios = require('axios');

module.exports = async function fetchImage(url) {
    try {
        const response = await axios({ url, responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Error fetching image:', error.message);
        return null;
    }
}; 