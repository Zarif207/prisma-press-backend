import { PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";

export interface ICreatePostPayload {
  title: string;
  content: string;
  thumbnail?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  status?: PostStatus;
  tags: string[];
}

export interface IUpdatePostPayload {
  title?: string;
  content?: string;
  thumbnail?: string;
  isFeatured?: boolean;
  status?: PostStatus;
  tags?: string[];
}

export interface IPostQuery {
  searchTerm?: string;
  title?: string;
  content?: string;
  authorId?: string;
  isFeatured?: string; // raw query params are always strings
  tags?: string; // JSON string, parsed later with JSON.parse
  status?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
}
