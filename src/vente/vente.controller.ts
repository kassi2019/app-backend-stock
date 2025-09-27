import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { CreateVenteDto } from './dtos/create-vente.dto';
import { VenteService } from './vente.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('vente')
@UseGuards(JwtAuthGuard)
export class VenteController {
    constructor(private readonly venteService: VenteService) { }

    @Post('ajouterVente')
    async create(
        @Body() dto: CreateVenteDto,
        @Req() req: any) {

        const userId = req.user.sub;
        const result = await this.venteService.create(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }
}
