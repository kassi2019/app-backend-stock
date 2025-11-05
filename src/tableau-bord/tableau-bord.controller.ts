import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TableauBordService } from './tableau-bord.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';


@Controller('tableau-bord')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class TableauBordController {
  constructor(private readonly tableauBordService: TableauBordService) { }

  @Get('quantite-expirer')
  async getQuantiteExpirer() {
    return this.tableauBordService.AfficherQuantiteExpirer();
  }

  @Get('quantite-disponible')
  async getQuantiteDisponible() {
    return this.tableauBordService.AfficherQuantiteDisponible();
  }


  @Get('quantite-en-attente')
  async getQuantiteEnAttente() {
    return this.tableauBordService.AfficherQuantiteEnAttente();
  }

  @Get('quantite-par-mois')
  async getQuantiteParMois() {
    return this.tableauBordService.getQuantiteRenteeParMois();
  }

  @Get('pertes-expiration')
  async getPertesExpiration() {
    return this.tableauBordService.getPertesEtExpirations();
  }

  @Get('detail-stock-disponible')
  async getDetailStockDisponible() {
    return this.tableauBordService.getDetailStockDisponible();
  }

  @Get('detail-quantite-en-attente')
  async getDetailQuantiteAttente() {
    return this.tableauBordService.getDetailQuantiteAttente();
  }

  @Get('detail-quantite-expiration-bientot')
  async getDetailQuantiteExpiration() {
    return this.tableauBordService.getDetailQuantiteBientotExpire();
  }

  @Get('detail-quantite-expiration-aujourd-hui')
  async getDetailQuantiteExpireAujourdHui() {
    return this.tableauBordService.getDetailQuantiteExpireAujourdHui();
  }

  @Get('detail-quantite-Detruite')
  async getDetailQuantiteDetruite() {
    return this.tableauBordService.getDetailQuantiteDetruite();
  }

  @Get('detail-quantite-Non-Detruite')
  async getDetailQuantiteNonDetruite() {
    return this.tableauBordService.getDetailQuantiteNonDetruite();
  }


  @Get('evolution-vente-par-jour')
  async getEvolutionVenteParJour() {
    return this.tableauBordService.getEvolutionVenteParJour();
  }

  @Get('evolution-vente-par-mois')
  async getEvolutionVenteParMois() {
    return this.tableauBordService.getEvolutionVenteParMois();
  }

  @Get('evolution-vente-par-annee')
  async getEvolutionVenteParAnnee() {
    return this.tableauBordService.getEvolutionVenteParAnnee();
  }



  @Get('pan-caissier')
  async getfonctionDuPanTableauBordCaissier(@Req() req: any) {
    const userId = req.user.sub;
    return this.tableauBordService.FonctionDuPanTableauBordCaissier(userId);
  }

  @Get('evolution-par-jour-par-caissier')
  getEvolutionVenteParJourParCaissier(@Req() req: any) {
    const userId = req.user.sub;
    return this.tableauBordService.EvolutionVenteParJourParCaissier(userId);
  }




  
  @Get('evolution-par-jour-par-mode-paiement')
  getEvolutionVenteParModePaiement(@Req() req: any) {
    const userId = req.user.sub;
    return this.tableauBordService.EvolutionVenteParModePaiement(userId);
  }
}
