import { Controller, Post, UseGuards } from '@nestjs/common';
import { AutreStockService } from './autre-stock.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('autre-stock')
@UseGuards(JwtAuthGuard)
export class AutreStockController {
  constructor(private readonly autreStockService: AutreStockService) { }

  @Post('verifier-expiration')
  async verifierExpiration() {
    await this.autreStockService.verifierLotsExpires();
    return { message: 'Vérification manuelle effectuée' };
  }
}
