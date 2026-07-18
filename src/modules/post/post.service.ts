import { CommentStatus, PostStatus } from "../../../generated/prisma/enums"
import { PostWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface"

const createPost = async (payload: ICreatePostPayload, userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        include: {
            subscription: true
        }
    })

    if (payload.isPremium && user.subscription?.status !== "ACTIVE") {
        throw new Error("You are not a premium user. So You can not create Premium content")
    }

    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })

    return result
}

const getAllPosts = async (query: IPostQuery) => {

    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc"

    const tags = query.tags ? JSON.parse(query.tags as string) : null

    const tagsArray = Array.isArray(tags) ? tags : []

    const andConditions: PostWhereInput[] = []

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    },
                }
            ]
        })
    }

    if (query.title) {
        andConditions.push({
            title: query.title
        })
    }

    if (query.content) {
        andConditions.push({
            content: query.content
        })
    }

    if (query.authorId) {
        andConditions.push({
            authorId: query.authorId
        })
    }

    // ✅ FIX: query.isFeatured is a string from the URL (e.g. "false"),
    // Boolean("false") is true — must compare the string value explicitly.
    if (query.isFeatured) {
        andConditions.push({
            isFeatured: query.isFeatured === "true"
        })
    }

    if (query.tags) {
        andConditions.push({
            tags: {
                hasSome: tagsArray
            }
        })
    }

    if (query.status) {
        andConditions.push({
            status: query.status
        })
    }

    andConditions.push({
        isPremium: false
    })

    const posts = await prisma.post.findMany(
        {
            where: {
                AND: andConditions
            },

            take: limit,
            skip: skip,

            orderBy: {
                [sortBy]: sortOrder
            },

            include: {
                author: {
                    omit: {
                        password: true
                    }
                },
                comments: true
            }
        }
    );

    const totalPostCount = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })

    return {
        data: posts,
        meta: {
            page: page,
            limit: limit,
            total: totalPostCount,
            totalPages: Math.ceil(totalPostCount / limit)
        }
    }
}

const getPostById = async (postId: string) => {

    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.post.update({
                where: {
                    id: postId,
                },
                data: {
                    views: {
                        increment: 1
                    },
                }
            });

            // NOTE: this unconditionally excludes premium posts for everyone,
            // since there's no userId/subscription check here (unlike createPost).
            // If subscribers should be able to view premium posts, this function
            // needs a userId param and a subscription-status check.
            const post = await tx.post.findUniqueOrThrow({
                where: {
                    id: postId,
                    isPremium: false
                },

                include: {
                    author: {
                        omit: {
                            password: true
                        }
                    },

                    comments: {
                        where: {
                            status: CommentStatus.APPROVED
                        },

                        orderBy: {
                            createdAt: "desc"
                        }
                    },

                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            });
            return post
        }
    );

    return transactionResult
}

const updatePost = async (postId: string, payload: IUpdatePostPayload, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not the owner of this post!")
    }

    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })

    return result;
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    });

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not the owner of this post!")
    }

    await prisma.post.delete({
        where: {
            id: postId
        }
    })
}

const getPostsStats = async () => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            const [
                totalPosts,
                totalPublishedPosts,
                totalDraftPosts,
                totalArchivedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViewsAggregate
            ] = await Promise.all([
                tx.post.count(),
                tx.post.count({
                    where: {
                        status: PostStatus.PUBLISHED
                    }
                }),
                tx.post.count({
                    where: {
                        status: PostStatus.DRAFT
                    }
                }),
                tx.post.count({
                    where: {
                        status: PostStatus.ARCHIVED
                    }
                }),
                tx.comment.count(),
                tx.comment.count({
                    where: {
                        status: CommentStatus.APPROVED
                    }
                }),
                tx.comment.count({
                    where: {
                        status: CommentStatus.REJECT
                    }
                }),
                tx.post.aggregate({
                    _sum: {
                        views: true
                    }
                })
            ]);

            return {
                totalPosts,
                totalPublishedPosts,
                totalDraftPosts,
                totalArchivedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViews: totalPostViewsAggregate._sum.views
            }
        }
    );

    return transactionResult
}

const getMyPosts = async (authorId: string) => {

    const result = await prisma.post.findMany({
        where: {
            authorId
        },

        orderBy: {
            createdAt: "desc"
        },

        include: {
            comments: true,
            author: {
                omit: {
                    password: true
                }
            },

            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    return result;
}

export const postService = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostsStats,
    getMyPosts
}