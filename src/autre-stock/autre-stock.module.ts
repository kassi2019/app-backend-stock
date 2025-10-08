import { Module } from '@nestjs/common';
import { AutreStockService } from './autre-stock.service';
import { AutreStockController } from './autre-stock.controller';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AutreStockController],
  providers: [AutreStockService],
})
export class AutreStockModule {}
