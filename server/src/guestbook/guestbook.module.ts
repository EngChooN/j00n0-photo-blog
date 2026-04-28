import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { GuestbookController } from './guestbook.controller';
import { GuestbookService } from './guestbook.service';

@Module({
  imports: [AuthModule],
  controllers: [GuestbookController],
  providers: [GuestbookService],
})
export class GuestbookModule {}
