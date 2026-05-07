import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthOptionalGuard } from '@/auth/guards/jwt-auth-optional.guard';
import { isBlogOwner } from '@/lib/auth-helpers';
import { getVisitorIpHash } from '@/lib/visitor-ip';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get('posts/:postId/comments')
  list(@Param('postId') postId: string, @Req() req: Request) {
    return this.comments.list(postId, getVisitorIpHash(req));
  }

  @Post('posts/:postId/comments')
  create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    return this.comments.create(postId, dto, getVisitorIpHash(req));
  }

  @UseGuards(JwtAuthOptionalGuard)
  @Delete('comments/:id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.comments.remove(
      id,
      isBlogOwner(req) ? null : getVisitorIpHash(req),
    );
  }
}
