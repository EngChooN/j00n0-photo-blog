import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const postMetadataSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(120),
  caption: z.string().max(800).optional().default(''),
  location: z.string().max(120).optional().default(''),
  takenAt: z.string().max(20).optional().default(''),
  projectId: z.string().max(40).optional().default(''),
});

export type PostMetadataInput = z.infer<typeof postMetadataSchema>;

export const projectFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(120),
  concept: z.string().max(800).optional().default(''),
  startDate: z.string().max(20).optional().default(''),
  endDate: z.string().max(20).optional().default(''),
  status: z.enum(['ongoing', 'completed']).default('ongoing'),
  isPublic: z.boolean().default(true),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export const guestbookSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(40),
  message: z.string().min(1, '메시지를 입력해주세요').max(800),
});

export type GuestbookInput = z.infer<typeof guestbookSchema>;

export const commentSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(40),
  body: z.string().min(1, '댓글을 입력해주세요').max(800),
});

export type CommentInput = z.infer<typeof commentSchema>;
