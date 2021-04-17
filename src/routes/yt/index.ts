import express from 'express';
import related from './related';
import search from './search';
import suggest from './suggest';
import url from './url';

const router = express.Router();

router.use('/url', url);
router.use('/search', search);
router.use('/related', related);
router.use('/suggest', suggest);

export default router;
