import { errorResponse, serverErrorResponse } from '../services/response.service.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.code === 'P2002') {
        return errorResponse(res, 'A record with this value already exists', 409);
    }

    if (err.code === 'P2025') {
        return errorResponse(res, 'Record not found', 404);
    }

    if (err.code === 'P2003') {
        return errorResponse(res, 'Foreign key constraint failed', 400);
    }

    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    if (err.name === 'ValidationError') {
        return errorResponse(res, err.message, 400);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    if (statusCode === 500) {
        return serverErrorResponse(res,
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : message
        );
    }

    return errorResponse(res, message, statusCode);
};