require('dotenv').config();

const Database = require('../classes/Database.js');
const redis = require('redis');
const md5 = require('md5');
const phin = require('phin');

class App {
    constructor() {
        this.server_started = Date.now();
        
        // Utility functions
        this.md5 = md5;
        this.log = (object) => console.log(require('util').inspect(object, false, null, true));
        
        this.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        this.randomSleep = async (min, max = -1) => {
            min = Math.abs(min);
            if (max == -1) {
                max = min;
                min = 0;
            } else if (max < min) {
                throw new Error('max cannot be greater than min ' + min + ' ' + max);
            }
            
            const base = min;
            const diff = max - min;
            const random = Math.floor(Math.random() * diff);
            
            await this.sleep(base + random);
        };
        
        this.now = (mod = 0) => {
            let now = Math.floor(Date.now() / 1000);
            if (mod != 0) now = now - (now % mod);
            return now;
        };
        
        this.restart = () => {
            setTimeout(() => process.exit(), 3000);
        };
        
        // Load utility modules
        this.util = {};
        try {
            this.util.isDowntime = require('../util/isDowntime.js');
        } catch (e) {
            console.log('Warning: Could not load util modules', e.message);
        }
    }
    
    async init() {
        // Initialize MySQL
        if (process.env.MYSQL_LOAD === 'true' && process.env.MYSQL_URL) {
            this.mysql = new Database(process.env.MYSQL_URL);
            console.log('✓ MySQL connected');
        }
        
        // Initialize Redis
        if (process.env.REDIS_LOAD === 'true') {
            this.redis = redis.createClient({
                url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
            });
            
            this.redis.on('error', (err) => console.error('Redis error:', err));
            await this.redis.connect();
            console.log('✓ Redis connected');
        }
        
        // Initialize Phin (HTTP client)
        if (process.env.PHIN_LOAD === 'true') {
            this.phin = phin.defaults({
                method: 'get',
                headers: {
                    'User-Agent': process.env.USER_AGENT || 'evewho.com'
                }
            });
            console.log('✓ Phin HTTP client loaded');
        }
        
        return this;
    }
    
    async close() {
        if (this.mysql) await this.mysql.close();
        if (this.redis) await this.redis.quit();
    }
}

module.exports = App;
