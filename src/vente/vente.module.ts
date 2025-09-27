import { Module } from '@nestjs/common';
import { VenteService } from './vente.service';
import { VenteController } from './vente.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ProduitGateway } from 'src/produit/produit.gateway';
@Module({
  providers: [VenteService, PrismaService, ProduitGateway],
  controllers: [VenteController],
  exports: [VenteService, ProduitGateway],
})
export class VenteModule { }
