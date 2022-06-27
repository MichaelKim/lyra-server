// Route: POST /user/logout
// Params:
// Response:
import express from 'express';

const router = express.Router();

router.post('/', (req, res, next) => {
  req.logout(err => {
    if (err) next(err);
    else res.redirect('/');
  });
});

export default router;
