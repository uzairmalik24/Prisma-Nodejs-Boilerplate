import prisma from "../prisma.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies, verifyRefreshToken } from "../services/token.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse, createdResponse, notFoundResponse, unauthorizedResponse } from "../services/response.service.js";
import { paginate, buildSearchWhere, getPaginationParams } from "../services/pagination.service.js";

export default {

    getUsers: asyncHandler(async (req, res) => {
        const { search } = req.query;
        const paginationParams = getPaginationParams(req.query);

        const where = buildSearchWhere(['name', 'email'], search);

        const result = await paginate({
            model: 'user',
            where,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
            ...paginationParams
        });

        return successResponse(res, 'Users fetched successfully', result);
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return notFoundResponse(res, 'User not found');
        }

        return successResponse(res, 'User fetched successfully', user);
    }),

    register: asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, 'Name, email and password are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse(res, 'Invalid email format');
        }

        if (password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters long');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return errorResponse(res, 'User with this email already exists', 409);
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });

        const payload = { id: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        setAuthCookies(res, accessToken, refreshToken);

        return createdResponse(res, 'User registered successfully', user);
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 'Email and password are required');
        }

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user || !user.password) {
            return unauthorizedResponse(res, 'Invalid email or password');
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return unauthorizedResponse(res, 'Invalid email or password');
        }

        const payload = { id: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        setAuthCookies(res, accessToken, refreshToken);

        return successResponse(res, 'Login successful', {
            id: user.id,
            name: user.name,
            email: user.email
        });
    }),

    logout: asyncHandler(async (req, res) => {
        clearAuthCookies(res);
        return successResponse(res, 'Logout successful');
    }),

    getCurrentUser: asyncHandler(async (req, res) => {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return notFoundResponse(res, 'User not found');
        }

        return successResponse(res, 'User fetched successfully', user);
    }),

    refreshToken: asyncHandler(async (req, res) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return unauthorizedResponse(res, 'Refresh token not found');
        }

        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return errorResponse(res, 'Invalid refresh token', 403);
        }

        const payload = { id: decoded.id, email: decoded.email };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        setAuthCookies(res, newAccessToken, newRefreshToken);

        return successResponse(res, 'Tokens refreshed successfully');
    })

};