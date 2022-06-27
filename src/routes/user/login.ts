// Route: /user/login
// Params:
// Response:
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.post('/', passport.authenticate('local'), (req, res) => {
  res.send({ id: req.user!.id });
});

export default router;
