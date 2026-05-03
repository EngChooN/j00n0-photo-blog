import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { JwtAuthOptionalGuard } from '@/auth/guards/jwt-auth-optional.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

const isAdmin = (req: Request): boolean =>
  (req.user as { role?: string } | undefined)?.role === 'admin';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @UseGuards(JwtAuthOptionalGuard)
  @Get()
  list(@Req() req: Request) {
    return this.projects.list(isAdmin(req));
  }

  @UseGuards(JwtAuthOptionalGuard)
  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: Request) {
    return this.projects.getOne(id, isAdmin(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projects.create(file, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(id, file, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projects.remove(id);
  }
}
