import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '../services/token.service.js';

const PUBLIC_ROUTES = [
    { method: 'POST', path: '/api/user/register' },
    { method: 'POST', path: '/api/user/login' },
    { method: 'POST', path: '/api/user/refresh' },
    { method: 'POST', path: '/api/user/me' },
    { method: 'GET', path: '/health' },
    
    // Public post routes
    { method: 'GET', path: '/api/posts' },
    { method: 'GET', path: '/api/posts/:id' },
    { method: 'GET', path: '/api/posts/user/:userId' },
    
];

const isPublicRoute = (method, path) => {
    return PUBLIC_ROUTES.some(route => {
        if (route.method === method && route.path === path) {
            return true;
        }
        
        const routePattern = route.path.replace(/:\w+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return route.method === method && regex.test(path);
    });
};

const authenticateToken = async (req, res, next) => {
    try {

        if (isPublicRoute(req.method, req.path)) {
            console.log('Public route, skipping auth');
            return next();
        }

        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        if (!accessToken) {
            return res.status(401).json({ 
                message: 'Access token not found. Please login.' 
            });
        }

        const decoded = verifyAccessToken(accessToken);
        
        if (decoded) {
            req.user = decoded;
            return next();
        }


        if (!refreshToken) {
            return res.status(401).json({ 
                message: 'Session expired. Please login again.' 
            });
        }

        const refreshDecoded = verifyRefreshToken(refreshToken);
        
        if (!refreshDecoded) {
            return res.status(403).json({ 
                message: 'Invalid refresh token. Please login again.' 
            });
        }


        const payload = {
            id: refreshDecoded.id,
            email: refreshDecoded.email
        };

        const newAccessToken = generateAccessToken(payload);
        
        res.cookie('accessToken', newAccessToken, {
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        req.user = payload;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            message: 'Authentication failed.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded) {
                req.user = decoded;
            }
        }
        
        next();
    } catch (error) {
        next();
    }
};

export { authenticateToken, optionalAuth };