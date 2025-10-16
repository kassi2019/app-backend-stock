import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RapportService } from './rapport.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';


@Controller('rapport')
  @UseGuards(JwtAuthGuard)
export class RapportController {
  constructor(private readonly rapportService: RapportService) { }


  @Get('quantites-entrantes')
  async getProduitsEntrant(
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    if (!dateDebut || !dateFin) {
      throw new BadRequestException(
        'Veuillez fournir les deux dates : ?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD',
      );
    }

    return this.rapportService.rapportEntreeProduitLot(dateDebut, dateFin);
  }

   @Get('quantites-sortantes')
  async getProduitsSortant(
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    if (!dateDebut || !dateFin) {
      throw new BadRequestException(
        'Veuillez fournir les deux dates : ?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD',
      );
    }

    return this.rapportService.rapportQuantiteVendue(dateDebut, dateFin);
  }
}
