import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import mongodb from 'mongodb';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Basic ')) {
      try {
        const emailAndPass = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf8').split(':');
        const user = await dbClient.usersCollection().findOne({
          email: emailAndPass[0],
          password: sha1(emailAndPass[1]),
        });

        if (user) {
          const token = uuidv4();
          await redisClient.set(token, user._id.toString(), 24 * 60 * 60);
          res.set('X-Token', token);
          return res.status(200).json({ token });
        }
        return res.status(401).json({ error: 'Invalid email or password' });
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(400).json({ error: 'Authorization header missing or invalid' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['X-Token'] || req.headers['x-token'];
    const user_id = await redisClient.get(token);
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(token);
    return res.status(204).json({});
  }

  static async getMe(req, res) {
    const token = req.headers['X-Token'] || req.headers['x-token'];
    try {
      const user_id = await redisClient.get(token);
      if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.usersCollection().findOne({ _id: new mongodb.ObjectId(user_id) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.json({ id: user._id, email: user.email });
    } catch (err) {
      console.error('Error retrieving user:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
