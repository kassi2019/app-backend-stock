import { Module } from '@nestjs/common';
import { ModePaiementService } from './mode-paiement.service';
import { ModePaiementController } from './mode-paiement.controller';

@Module({
  controllers: [ModePaiementController],
  providers: [ModePaiementService],
})
export class ModePaiementModule {}
