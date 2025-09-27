import { Module } from '@nestjs/common';
import { TypeEquipementService } from './type-equipement.service';
import { TypeEquipementController } from './type-equipement.controller';

@Module({
  providers: [TypeEquipementService],
  controllers: [TypeEquipementController]
})
export class TypeEquipementModule {}
