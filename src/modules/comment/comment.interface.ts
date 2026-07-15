import { PostStatus } from "../../../generated/prisma/enums";

export interface ICreateCommentPayload {
  title: string;
  content: string;
  thumbNail?: string;
  isFeatured?: boolean;
  status?: PostStatus;
  postId: string;
}

export interface IUpdateCommentPayload {
  title?: string;
  content: string;
  thumbNail?: string;
  isFeatured?: boolean;
  status?: PostStatus;
}
