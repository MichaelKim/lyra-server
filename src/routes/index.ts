import express from 'express';
import yt from './yt';

const router = express.Router();

router.use('/yt', yt);

export default router;
