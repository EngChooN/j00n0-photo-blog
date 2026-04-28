import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

const MAX_FILES = 20;

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list() {
    return this.posts.list();
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
}
