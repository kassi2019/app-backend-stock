import { Module } from '@nestjs/common';
import { ProduitLotController } from './produit-lot.controller';

@Module({
  controllers: [ProduitLotController]
})
export class ProduitLotModule {}
