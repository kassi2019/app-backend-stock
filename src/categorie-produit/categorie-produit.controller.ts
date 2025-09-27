
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CategorieProduitService } from './categorie-produit.service';
import { CategorieProduitDtoUpdate, CategorieProduitDtoCreate } from './dtos/categorieProduitDto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('categorie-produit')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class CategorieProduitController {

    constructor(private categorieProduitService: CategorieProduitService) { }

    // afficher tout les type d'équipements
    @Get('liste')
    async findAll() {
        const result = await this.categorieProduitService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Liste réussie',
            data: result,
        };
    }

    // créer un type d'équipement
    @Post('creer')

    async create(
        @Body() dto: CategorieProduitDtoCreate,
        @Req() req: any) {

        const userId = req.user.sub;
        const result = await this.categorieProduitService.create(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }

    // modifier un type d'équipement
    @Put('modifier/:id')
    async update(@Param('id') id: number,
        @Body() dto: CategorieProduitDtoUpdate) {
        const result = await this.categorieProduitService.update(id, dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }

    // supprimer un type d'équipement
    @Delete('supprimer/:id')
    async delete(@Param('id') id: number) {
        const result = await this.categorieProduitService.delete(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }
    // afficher un type d'équipement
    @Get('detail/:id')
    async findOne(@Param('id') id: number) {
        const result = await this.categorieProduitService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Détail réussie',
            data: result,
        };
    }
}
