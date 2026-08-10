import { Module } from '@nestjs/common';
import { SituationRoomController } from './situation-room.controller';
import { SituationRoomService } from './situation-room.service';

@Module({
  controllers: [SituationRoomController],
  providers: [SituationRoomService],
})
export class SituationRoomModule {}
