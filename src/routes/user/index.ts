import express from 'express';
import login from './login';
import logout from './logout';
import register from './register';
import whoami from './whoami';

const router = express.Router();

router.use('/login', login);
router.use('/logout', logout);
router.use('/register', register);
router.use('/whoami', whoami);

export default router;
