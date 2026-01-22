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

export default {

    getPosts: asyncHandler(async (req, res) => {
        const { search } = req.query;
        const paginationParams = getPaginationParams(req.query);

        const where = buildSearchWhere(['captions'], search);

        const result = await paginate({
            model: 'post',
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
            orderBy: { createdAt: 'desc' },
            ...paginationParams
        });

        return successResponse(res, 'Posts fetched successfully', result);
    }),

    getPostById: asyncHandler(async (req, res) => {
        const { id } = req.params;

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

        return successResponse(res, 'Post updated successfully', updatedPost);
    }),

    getPostsByUserId: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const paginationParams = getPaginationParams(req.query);

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

        return successResponse(res, 'User posts fetched successfully', result);
    }),

    getMyPosts: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const paginationParams = getPaginationParams(req.query);

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

        return successResponse(res, 'Post deleted successfully');
    }),

    getMyPostStats: asyncHandler(async (req, res) => {
        const userId = req.user.id;

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

        return successResponse(res, 'Post statistics fetched successfully', {
            totalPosts: stats._count.id,
            totalSaves: savedCount
        });
    })

};