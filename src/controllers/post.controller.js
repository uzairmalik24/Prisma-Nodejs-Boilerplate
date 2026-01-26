import prisma from "../prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    successResponse,
    errorResponse,
    createdResponse,
    notFoundResponse,
    forbiddenResponse
} from "../services/response.service.js";
import { paginate, buildSearchWhere, getPaginationParams } from "../services/pagination.service.js";
import redis from "../config/redis.js";

// Helper function to invalidate related cache keys
const invalidatePostCaches = async (userId = null) => {
    const patterns = [
        'posts:search=*',
        'posts:user:*',
        'posts:my:*',
        'posts:stats:*'
    ];

    if (userId) {
        patterns.push(`posts:user:${userId}:*`);
        patterns.push(`posts:my:${userId}:*`);
        patterns.push(`posts:stats:${userId}`);
    }

    for (const pattern of patterns) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    }
};

export default {

    getPosts: asyncHandler(async (req, res) => {
        const { search = "" } = req.query;
        const paginationParams = getPaginationParams(req.query);

        const cacheKey = `posts:search=${search}:page=${paginationParams.page}:limit=${paginationParams.limit}`;

        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return successResponse(
                res,
                "Posts fetched successfully (from cache)",
                JSON.parse(cachedData)
            );
        }

        const where = buildSearchWhere(["captions"], search);

        const result = await paginate({
            model: "post",
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        savedPosts: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            ...paginationParams
        });

        await redis.setEx(cacheKey, 300, JSON.stringify(result));

        return successResponse(res, "Posts fetched successfully", result);
    }),

    getPostById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const cacheKey = `posts:id:${id}`;

        const cachedPost = await redis.get(cacheKey);
        if (cachedPost) {
            return successResponse(
                res,
                'Post fetched successfully (from cache)',
                JSON.parse(cachedPost)
            );
        }

        const post = await prisma.post.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        savedPosts: true
                    }
                }
            }
        });

        if (!post) {
            return notFoundResponse(res, 'Post not found');
        }

        await redis.setEx(cacheKey, 600, JSON.stringify(post));

        return successResponse(res, 'Post fetched successfully', post);
    }),

    createPost: asyncHandler(async (req, res) => {
        const { captions } = req.body;
        const userId = req.user.id;

        if (!captions || captions.trim() === '') {
            return errorResponse(res, 'Captions are required');
        }

        const newPost = await prisma.post.create({
            data: {
                captions: captions.trim(),
                userId: userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        await invalidatePostCaches(userId);

        return createdResponse(res, 'Post created successfully', newPost);
    }),

    updatePost: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { captions } = req.body;
        const userId = req.user.id;

        if (!captions || captions.trim() === '') {
            return errorResponse(res, 'Captions are required');
        }

        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPost) {
            return notFoundResponse(res, 'Post not found');
        }

        if (existingPost.userId !== userId) {
            return forbiddenResponse(res, 'You are not authorized to update this post');
        }

        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: {
                captions: captions.trim(),
                updatedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        await redis.del(`posts:id:${id}`);
        await invalidatePostCaches(userId);

        return successResponse(res, 'Post updated successfully', updatedPost);
    }),

    getPostsByUserId: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const paginationParams = getPaginationParams(req.query);

        const cacheKey = `posts:user:${userId}:page=${paginationParams.page}:limit=${paginationParams.limit}`;

        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return successResponse(
                res,
                'User posts fetched successfully (from cache)',
                JSON.parse(cachedData)
            );
        }

        const result = await paginate({
            model: 'post',
            where: {
                userId: parseInt(userId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        savedPosts: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            ...paginationParams
        });

        await redis.setEx(cacheKey, 300, JSON.stringify(result));

        return successResponse(res, 'User posts fetched successfully', result);
    }),

    getMyPosts: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const paginationParams = getPaginationParams(req.query);

        const cacheKey = `posts:my:${userId}:page=${paginationParams.page}:limit=${paginationParams.limit}`;

        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return successResponse(
                res,
                'Your posts fetched successfully (from cache)',
                JSON.parse(cachedData)
            );
        }

        const result = await paginate({
            model: 'post',
            where: {
                userId: userId
            },
            include: {
                _count: {
                    select: {
                        savedPosts: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            ...paginationParams
        });

        await redis.setEx(cacheKey, 300, JSON.stringify(result));

        return successResponse(res, 'Your posts fetched successfully', result);
    }),

    deletePost: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPost) {
            return notFoundResponse(res, 'Post not found');
        }

        if (existingPost.userId !== userId) {
            return forbiddenResponse(res, 'You are not authorized to delete this post');
        }

        await prisma.post.delete({
            where: { id: parseInt(id) }
        });

        await redis.del(`posts:id:${id}`);
        await invalidatePostCaches(userId);

        return successResponse(res, 'Post deleted successfully');
    }),

    getMyPostStats: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const cacheKey = `posts:stats:${userId}`;

        const cachedStats = await redis.get(cacheKey);
        if (cachedStats) {
            return successResponse(
                res,
                'Post statistics fetched successfully (from cache)',
                JSON.parse(cachedStats)
            );
        }

        const stats = await prisma.post.aggregate({
            where: { userId: userId },
            _count: {
                id: true
            }
        });

        const savedCount = await prisma.savedPosts.count({
            where: {
                post: {
                    userId: userId
                }
            }
        });

        const result = {
            totalPosts: stats._count.id,
            totalSaves: savedCount
        };

        // Cache for 10 minutes
        await redis.setEx(cacheKey, 600, JSON.stringify(result));

        return successResponse(res, 'Post statistics fetched successfully', result);
    })

};