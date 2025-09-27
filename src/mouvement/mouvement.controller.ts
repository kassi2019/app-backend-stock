
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { MouvementService } from './mouvement.service';

import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { MouvementDtoCreate, MouvementDtoUpdate } from './dtos/mouvementDto';
@Controller('mouvement')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class MouvementController {
    constructor(private mouvementService: MouvementService) { }

    // afficher tout les mouvements
    @Get('liste')
    async findAll() {
        const result = await this.mouvementService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Liste réussie',
            data: result,
        };
    }

    // créer un mouvement
    @Post('creer')
    async create(
        @Body() dto: MouvementDtoCreate,
        @Req() req: any) {

        const userId = req.user.sub;
        const result = await this.mouvementService.create(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }

    // modifier un mouvement
    @Put('modifier/:id')
    async update(@Param('id') id: number,
        @Body() dto: MouvementDtoUpdate) {
        const result = await this.mouvementService.update(id, dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }

    // supprimer un mouvement
    @Delete('supprimer/:id')
    async delete(@Param('id') id: number) {
        const result = await this.mouvementService.delete(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }
    // afficher un mouvement
    @Get('detail/:id')
    async findOne(@Param('id') id: number) {
        const result = await this.mouvementService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Détail réussie',
            data: result,
        };
    }
}
