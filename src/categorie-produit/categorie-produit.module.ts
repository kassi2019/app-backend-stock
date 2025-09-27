import { Module } from '@nestjs/common';
import { CategorieProduitService } from './categorie-produit.service';

@Module({
  providers: [CategorieProduitService]
})
export class CategorieProduitModule {}
