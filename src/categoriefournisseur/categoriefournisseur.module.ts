import { Module } from '@nestjs/common';
import { CategoriefournisseurService } from './categoriefournisseur.service';
import { CategoriefournisseurController } from './categoriefournisseur.controller';

@Module({
  controllers: [CategoriefournisseurController],
  providers: [CategoriefournisseurService],
})
export class CategoriefournisseurModule {}
