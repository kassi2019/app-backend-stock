import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
}
