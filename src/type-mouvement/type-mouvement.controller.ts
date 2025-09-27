
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { TypeMouvementService } from './type-mouvement.service';
import { TypeMouvementDtoCreate, TypeMouvementDtoUpdate } from './dtos/typeMouvementDto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('type-mouvement')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class TypeMouvementController {
    constructor(private typeMouvementService: TypeMouvementService) { }

    // afficher tout les type d'équipements
    @Get('liste')
    async findAll() {
        const result = await this.typeMouvementService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Liste réussie',
            data: result,
        };
    }

    // créer un type d'équipement
    @Post('creer')

    async create(
        @Body() dto: TypeMouvementDtoCreate,
        @Req() req: any) {

        const userId = req.user.sub;
        const result = await this.typeMouvementService.create(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }

    // modifier un type d'équipement
    @Put('modifier/:id')
    async update(@Param('id') id: number,
        @Body() dto: TypeMouvementDtoUpdate) {
        const result = await this.typeMouvementService.update(id, dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }

    // supprimer un type d'équipement
    @Delete('supprimer/:id')
    async delete(@Param('id') id: number) {
        const result = await this.typeMouvementService.delete(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }
    // afficher un type d'équipement
    @Get('detail/:id')
    async findOne(@Param('id') id: number) {
        const result = await this.typeMouvementService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Détail réussie',
            data: result,
        };
    }
}
