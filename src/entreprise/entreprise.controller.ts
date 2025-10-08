import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, Put, UseGuards } from '@nestjs/common';
import { EntrepriseService } from './entreprise.service';
import { CreateEntrepriseDto } from './dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('entreprise')
@UseGuards(JwtAuthGuard)
export class EntrepriseController {
  constructor(private entrepriseService: EntrepriseService) { }

  @Post('creer')

  async create(
    @Body() dto: CreateEntrepriseDto,
    @Req() req: any) {

    const userId = req.user.sub;
    const result = await this.entrepriseService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Création réussie',
      data: result,
    };
  }


  @Get('liste')
  async findAll() {
    const result = await this.entrepriseService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Liste réussie',
      data: result,
    };
  }

  @Put('modifier/:id')
  async update(@Param('id') id: number,
    @Body() dto: UpdateEntrepriseDto) {
    const result = await this.entrepriseService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modification réussie',
      data: result,
    };
  }


  @Delete('supprimer/:id')
  async delete(@Param('id') id: number) {
    const result = await this.entrepriseService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Suppression réussie',
      data: result,
    };
  }



  @Get('listeFournisseurParCatgorie')
  afficheListeLotParProduitInventaire(@Req() req: any) {
    const userId = req.user.sub;
    return this.entrepriseService.listeFournisseurParCatgorie();
  }
}
