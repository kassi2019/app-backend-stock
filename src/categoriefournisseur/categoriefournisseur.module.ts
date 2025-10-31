import { Module } from '@nestjs/common';
import { CategoriefournisseurService } from './categoriefournisseur.service1';
import { CategoriefournisseurController } from './categoriefournisseur.controller1';

@Module({
  controllers: [CategoriefournisseurController],
  providers: [CategoriefournisseurService],
})
export class CategoriefournisseurModule { }
