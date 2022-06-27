import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import IORedis from 'ioredis';

enum Keys {
  USERS = 'users', // hash of username to id
  USER = 'user:', // hash of user:{id} to user
  LAST_ID = 'user:id' // last user id
}

export const redis = new IORedis({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
});
initRedis();

// Setup initial fields
export async function initRedis() {
  try {
    // First ID
    await redis.set(Keys.LAST_ID, 1000, 'NX');
  } catch (err) {
    console.error('Error during initRedis:', err);
  }
}

function validateUser(obj: Record<string, string>) {
  return obj.id && obj.username && obj.password;
}

function encryptPassword(
  password: string,
  salt: string = randomBytes(16).toString('hex')
): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize(), salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex') + ':' + salt);
    });
  });
}

async function validatePassword(password: string, hash: string) {
  const [, salt] = hash.split(':');
  const result = await encryptPassword(password, salt);
  return timingSafeEqual(Buffer.from(result), Buffer.from(hash));
}

export async function findUserById(id: string): Promise<Express.User | false> {
  const user = await redis.hgetall(Keys.USER + id);
  if (!validateUser(user)) return false;

  return {
    id: user.id,
    username: user.username,
    password: user.password
  };
}

export async function findUser(
  username: string,
  password: string
): Promise<Express.User | false> {
  const id = await redis.hget(Keys.USERS, username);
  if (id == null) return false;

  const user = await findUserById(id);
  if (!user) return false;
  if (!(await validatePassword(password, user.password))) return false;

  return user;
}

export async function createUser(
  username: string,
  password: string
): Promise<Express.User> {
  if (await redis.hexists(Keys.USERS, username)) {
    throw { status: 400, message: 'Username already exists' };
  }

  const id = (await redis.incr(Keys.LAST_ID)).toString();
  const user: Express.User = {
    id,
    username,
    password: await encryptPassword(password)
  };

  const res = await redis
    .multi()
    .hset(Keys.USERS, { [username]: id })
    .hset(Keys.USER + id, user)
    .exec();
  if (res?.some(([err]) => err)) throw res;

  return user;
}
