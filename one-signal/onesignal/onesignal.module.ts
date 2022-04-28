import { Module } from '@nestjs/common';
import { OnesignalController } from './onesignal.controller';
import { OnesignalService } from './onesignal.service';

@Module({
  controllers: [OnesignalController],
  providers: [OnesignalService],
  exports : [OnesignalService]
})
export class OnesignalModule {}
