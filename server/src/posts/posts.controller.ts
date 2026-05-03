import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { JwtAuthOptionalGuard } from '@/auth/guards/jwt-auth-optional.guard';
import { getVisitorIpHash } from '@/lib/visitor-ip';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

const MAX_FILES = 20;

const isAdmin = (req: Request): boolean =>
  (req.user as { role?: string } | undefined)?.role === 'admin';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @UseGuards(JwtAuthOptionalGuard)
  @Get()
  list(@Req() req: Request) {
    return this.posts.list(isAdmin(req));
  }

  @UseGuards(JwtAuthOptionalGuard)
  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: Request) {
    return this.posts.getOne(id, isAdmin(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files', MAX_FILES))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreatePostDto,
  ) {
    return this.posts.create(files ?? [], dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('addedFiles', MAX_FILES))
  update(
    @Param('id') id: string,
    @UploadedFiles() addedFiles: Express.Multer.File[],
    @Body() dto: UpdatePostDto,
  ) {
    return this.posts.update(id, dto, addedFiles ?? []);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }

  @Post(':id/like')
  @HttpCode(200)
  like(@Param('id') id: string, @Req() req: Request) {
    return this.posts.like(id, getVisitorIpHash(req));
  }

  @Delete(':id/like')
  @HttpCode(200)
  unlike(@Param('id') id: string, @Req() req: Request) {
    return this.posts.unlike(id, getVisitorIpHash(req));
  }

  @Get(':id/like')
  hasLiked(@Param('id') id: string, @Req() req: Request) {
    return this.posts.hasLiked(id, getVisitorIpHash(req));
  }
}
