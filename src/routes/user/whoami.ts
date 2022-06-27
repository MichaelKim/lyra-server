// Route: GET /user/whoami
// Params:
// Response:
// - user
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send(req.user);
});

export default router;
