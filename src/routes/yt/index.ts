import express from 'express';
import related from './related';
import search from './search';
import suggest from './suggest';
import url from './url';

const router = express.Router();

router.use('/related', related);
router.use('/search', search);
router.use('/suggest', suggest);
router.use('/url', url);

export default router;
