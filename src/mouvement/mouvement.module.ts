import { Module } from '@nestjs/common';
import { MouvementController } from './mouvement.controller';
import { MouvementService } from './mouvement.service';

@Module({
  controllers: [MouvementController],
  providers: [MouvementService]
})
export class MouvementModule {}
