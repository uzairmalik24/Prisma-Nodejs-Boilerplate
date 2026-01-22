
export const generateResponse = (res, statusCode, success, message, data = null) => {
    const response = {
        success: success,
        message: message
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

export const successResponse = (res, message, data = null, statusCode = 200) => {
    return generateResponse(res, statusCode, true, message, data);
};

export const errorResponse = (res, message, statusCode = 400, data = null) => {
    return generateResponse(res, statusCode, false, message, data);
};

export const createdResponse = (res, message, data = null) => {
    return generateResponse(res, 201, true, message, data);
};

export const notFoundResponse = (res, message = 'Resource not found') => {
    return generateResponse(res, 404, false, message);
};

export const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return generateResponse(res, 401, false, message);
};

export const forbiddenResponse = (res, message = 'Forbidden') => {
    return generateResponse(res, 403, false, message);
};

export const serverErrorResponse = (res, message = 'Internal server error') => {
    return generateResponse(res, 500, false, message);
};