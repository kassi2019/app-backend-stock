import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDtoCreate, RoleDtoUpdate } from './dtos/roleDto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('roles')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }
    

    // afficher tous les roles
    @Get('liste')
    async findAll() {
        const result = await this.rolesService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Liste réussie',
            data: result,
        };
    }
    // créer un role
    @Post('creer')
    async create(
        @Body() dto: RoleDtoCreate,
        @Req() req: any) {
        const userId = req.user.sub;
        const result = await this.rolesService.create(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }

   @Put('modifier/:id')
    async update(@Param('id') id: number,
        @Body() dto: RoleDtoUpdate) {
        const result = await this.rolesService.update(id, dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }
    // supprimer un role
    @Delete('supprimer/:id')
    async delete(@Param('id') id: number) {
        const result = await this.rolesService.delete(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }
    // afficher un role
    @Get('detail/:id')
    async findOne(@Param('id') id: number) {
        const result = await this.rolesService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Détail réussie',
            data: result,
        };
    }
}
