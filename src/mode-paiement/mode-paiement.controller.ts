import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, Put, UseGuards } from '@nestjs/common';
import { ModePaiementService } from './mode-paiement.service';
import { CreateModePaiementDto } from './dto/create-mode-paiement.dto';
import { UpdateModePaiementDto } from './dto/update-mode-paiement.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('mode-paiement')
@UseGuards(JwtAuthGuard)
export class ModePaiementController {
  constructor(private readonly modePaiementService: ModePaiementService) { }


  @Post('creer')

  async create(
    @Body() dto: CreateModePaiementDto,
    @Req() req: any) {

    const userId = req.user.sub;
    const result = await this.modePaiementService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Création réussie',
      data: result,
    };
  }


  @Get('liste')
  async findAll() {
    const result = await this.modePaiementService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Liste réussie',
      data: result,
    };
  }

  @Put('modifier/:id')
  async update(@Param('id') id: number,
    @Body() dto: UpdateModePaiementDto) {
    const result = await this.modePaiementService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modification réussie',
      data: result,
    };
  }


  @Delete('supprimer/:id')
  async delete(@Param('id') id: number) {
    const result = await this.modePaiementService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Suppression réussie',
      data: result,
    };
  }
}
