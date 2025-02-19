const express = require('express');
const app = express();
const uploadRoutes = require('./routes/uploadRoutes');
const statusRoutes = require('./routes/statusRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const imageProcessingQueue = require('./services/queueService');

app.use('/', uploadRoutes);
app.use('/', statusRoutes);
app.use('/', webhookRoutes);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullAdapter(imageProcessingQueue)],
    serverAdapter: serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 