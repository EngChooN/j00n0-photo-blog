import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { GuestbookModule } from './guestbook/guestbook.module';
import { HealthModule } from './health/health.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PostsModule,
    GuestbookModule,
    HealthModule,
    CommentsModule,
  ],
})
export class AppModule {}
