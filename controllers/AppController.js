import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  static async getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) res.status(200).json({ redis: true, db: true });
  }

  static async getStats(req, res) {
    const numFiles = await dbClient.nbFiles();
    const numUser = await dbClient.nbUsers();
    res.status(200).json({ users: numUser, files: numFiles });
  }
}
export default AppController;
