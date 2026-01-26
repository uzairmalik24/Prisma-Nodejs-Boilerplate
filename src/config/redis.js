import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();


const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (error) => {
    console.log('redis error: ', error);
})


await redisClient.connect(() => {
    console.log('redis connected');
 });

export default redisClient;