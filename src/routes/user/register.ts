// Route: POST /user/register
// Params:
// - username
// - password
// Response:
// - id: new user id
import { Router } from 'express';
import { createUser } from '../../database';
import { Request } from '../../types';

const router = Router();

type Body = {
  username: string;
  password: string;
};

router.post('/', async (req: Request<{}, Body>, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({ status: 400, message: 'Missing username or password' });
    return;
  }

  const user = await createUser(username, password).catch(next);
  if (user == null) return;

  req.login(user, err => {
    if (err) next(err);
    else res.status(201).send({ id: user.id });
  });
});

export default router;
