import express from 'express';

const router = express.Router();

router.use('/yt', require('./yt'));

export default router;
