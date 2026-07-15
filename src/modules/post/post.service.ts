import { CommentStatus, PostStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface"


const createPost = async (payload : ICreatePostPayload, userId : string) => {
   const result = await prisma.post.create({
    data: {
        ...payload,
        authorId: userId,
        status: PostStatus.DRAFT
    }
   })
   return result;
}





const getAllPosts = async () => {
    const posts = await prisma.post.findMany(
        {
            include: {
                author: {
                    omit: {
                        password: true
                    }
                },
                comments: true,
            }
        }
    )
    return posts;
}





const getPostById = async (postId : string) => {
    const posts = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true,
        }
    })

    const updatePost = await prisma.post.update({
        where: {
            id: postId
        },
        data: {
            views: {
                increment: 1
            }
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true,
        }
    })

    return updatePost;
}





const updatePost = async (postId : string, payload : IUpdatePostPayload, authorId : string, isAdmin : boolean) => {

}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {

}

const getPostsStats = async () => {

}

const getMyPosts = async (authorId: string) => {
    const result = await prisma.post.findMany({
        where: {
            authorId: authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true,
            _count: {              
                select: {
                    comments: true
                }
            }
        }
    })
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