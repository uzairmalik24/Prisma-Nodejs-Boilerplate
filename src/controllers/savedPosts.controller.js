import prisma from "../prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    successResponse,
    errorResponse,
    notFoundResponse
} from "../services/response.service.js";
import { paginate, getPaginationParams } from "../services/pagination.service.js";

export default {

    savePost: asyncHandler(async (req, res) => {
        const { postId } = req.body;
        const userId = req.user.id;

        if (!postId) {
            return errorResponse(res, 'postId is required');
        }

        const existingPost = await prisma.savedPosts.findFirst({
            where: {
                postId: parseInt(postId),
                userId: userId
            }
        });

        if (existingPost) {
            return errorResponse(res, 'Post already saved by the user');
        }

        const savedPost = await prisma.savedPosts.create({
            data: {
                userId,
                postId: parseInt(postId)
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return successResponse(res, 'Post saved successfully', savedPost);
    }),

    getSavedPostsByUser: asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const paginationParams = getPaginationParams(req.query);

        const result = await paginate({
            model: 'savedPosts',
            where: {
                userId: parseInt(userId)
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            ...paginationParams
        });

        return successResponse(res, 'Saved posts fetched successfully', result);
    }),

    getMySavedPosts: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const paginationParams = getPaginationParams(req.query);

        const result = await paginate({
            model: 'savedPosts',
            where: {
                userId: userId
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            ...paginationParams
        });

        return successResponse(res, 'Your saved posts fetched successfully', result);
    }),

    removeSavedPost: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        const existingSavedPost = await prisma.savedPosts.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!existingSavedPost) {
            return notFoundResponse(res, 'Saved post not found');
        }

        if (existingSavedPost.userId !== userId) {
            return errorResponse(res, 'You are not authorized to remove this saved post', 403);
        }

        const deletedSavedPost = await prisma.savedPosts.delete({
            where: {
                id: Number(id)
            }
        });

        return successResponse(res, 'Saved post removed successfully', deletedSavedPost);
    })

};