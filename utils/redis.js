import { createClient } from 'redis';
import { promisify } from 'util'
class RedisClient {
    constructor() {
        this.client = createClient();
        this.isConnected = true
        this.client.on('error', this.onError);
        this.client.on('connect', this.onConnect);
    }
    onError(err) {
        console.error(err.message);
        this.isConnected = false;
    }
    onConnect() {
        this.isConnected = true;
    }
    isAlive() {
        return this.isConnected;
    }
    async get(key) {
       return promisify(this.client.GET).bind(this.client)(key);
    }
    async set(key, value, seconds) {
        return promisify(this.client.SETEX).bind(this.client)(key, seconds, value);
    }
    async del(key) {
        return promisify(this.client.DEL).bind(this.client)(key);
    }
}

export const redisClient = new RedisClient();
export default redisClient;
