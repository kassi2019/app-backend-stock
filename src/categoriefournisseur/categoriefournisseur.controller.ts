import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, Put, UseGuards } from '@nestjs/common';
import { CategoriefournisseurService } from './categoriefournisseur.service';
import { CreateCategoriefournisseurDto } from './dto/create-categoriefournisseur.dto';
import { UpdateCategoriefournisseurDto } from './dto/update-categoriefournisseur.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('categoriefournisseur')
@UseGuards(JwtAuthGuard)
export class CategoriefournisseurController {
  constructor(private categoriefournisseurService: CategoriefournisseurService) { }

  @Post('creer')

  async create(
    @Body() dto: CreateCategoriefournisseurDto,
    @Req() req: any) {

    const userId = req.user.sub;
    const result = await this.categoriefournisseurService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Création réussie',
      data: result,
    };
  }


  @Get('liste')
  async findAll() {
    const result = await this.categoriefournisseurService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Liste réussie',
      data: result,
    };
  }

  @Put('modifier/:id')
  async update(@Param('id') id: number,
    @Body() dto: UpdateCategoriefournisseurDto) {
    const result = await this.categoriefournisseurService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modification réussie',
      data: result,
    };
  }


  @Delete('supprimer/:id')
  async delete(@Param('id') id: number) {
    const result = await this.categoriefournisseurService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Suppression réussie',
      data: result,
    };
  }
}
