// middlewares/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit';


const rateLimiter = (limit, options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000,
        limit: limit,           
        standardHeaders: 'draft-8', 
        legacyHeaders: false,    
        message: {
            success: false,
            message: `Too many requests. Please try again after ${Math.ceil(options.windowMs / 60000 || 15)} minutes.`,
        },
        statusCode: 429,
    };

    return rateLimit({
        ...defaultOptions,
        ...options,
    });
};

export default rateLimiter;