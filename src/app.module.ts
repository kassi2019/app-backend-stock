import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { TypeEquipementModule } from './type-equipement/type-equipement.module';


import { RolesModule } from './roles/roles.module';
import { TypeMouvementModule } from './type-mouvement/type-mouvement.module';
import { MouvementModule } from './mouvement/mouvement.module';
import { ProduitService } from './produit/produit.service';
import { ProduitController } from './produit/produit.controller';
import { ProduitModule } from './produit/produit.module';
import { ProduitLotService } from './produit-lot/produit-lot.service';
import { ProduitLotModule } from './produit-lot/produit-lot.module';
import { CategorieProduitController } from './categorie-produit/categorie-produit.controller';
import { CategorieProduitModule } from './categorie-produit/categorie-produit.module';
import { CategorieProduitService } from './categorie-produit/categorie-produit.service';
import { VenteModule } from './vente/vente.module';
import { EntrepriseModule } from './entreprise/entreprise.module';
import { CategoriefournisseurModule } from './categoriefournisseur/categoriefournisseur.module';
import { TableauBordModule } from './tableau-bord/tableau-bord.module';
import { AutreStockModule } from './autre-stock/autre-stock.module';
import { RapportModule } from './rapport/rapport.module';

import { LoggerModule } from './common/logger/logger.module';
import { ModePaiementModule } from './mode-paiement/mode-paiement.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, TypeEquipementModule, RolesModule, TypeMouvementModule, MouvementModule, ProduitModule, ProduitLotModule, CategorieProduitModule, VenteModule, EntrepriseModule, CategoriefournisseurModule, TableauBordModule, AutreStockModule, RapportModule, LoggerModule, ModePaiementModule],
  controllers: [AppController, ProduitController, CategorieProduitController],
  providers: [AppService, ProduitService, ProduitLotService, CategorieProduitService],
})
export class AppModule { }
