import { Module } from '@nestjs/common';
import { TableauBordService } from './tableau-bord.service';
import { TableauBordController } from './tableau-bord.controller';
import { ProduitGateway } from '../produit/produit.gateway';
@Module({
  controllers: [TableauBordController],
  providers: [TableauBordService, ProduitGateway],
  exports: [TableauBordService, ProduitGateway],
})
export class TableauBordModule { }
