const router = require('express').Router();

router.use('/url', require('./url'));
router.use('/query', require('./query'));
router.use('/related', require('./related'));

module.exports = router;
