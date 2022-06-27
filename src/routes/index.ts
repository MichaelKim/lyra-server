import express from 'express';
import user from './user';
import yt from './yt';

const router = express.Router();

router.use('/user', user);
router.use('/yt', yt);

export default router;
