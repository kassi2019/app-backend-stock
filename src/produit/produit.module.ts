import { Module } from '@nestjs/common';
import { ProduitController } from './produit.controller';
import { ProduitService } from './produit.service';
import { ProduitGateway } from './produit.gateway';
@Module({
    controllers: [ProduitController],
    providers: [ProduitService, ProduitGateway],
    exports: [ProduitService, ProduitGateway],

})
export class ProduitModule { }
