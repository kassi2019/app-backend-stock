import { Module } from '@nestjs/common';
import { TypeMouvementService } from './type-mouvement.service';
import { TypeMouvementController } from './type-mouvement.controller';

@Module({
  providers: [TypeMouvementService],
  controllers: [TypeMouvementController]
})
export class TypeMouvementModule {}
