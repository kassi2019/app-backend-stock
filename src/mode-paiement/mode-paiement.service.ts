import { Injectable } from '@nestjs/common';
import { CreateModePaiementDto } from './dto/create-mode-paiement.dto';
import { UpdateModePaiementDto } from './dto/update-mode-paiement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ModePaiementService {
  [x: string]: any;
  constructor(private readonly prisma: PrismaService) { }
  async create(data: CreateModePaiementDto, userId?: number) {
    return this.prisma.tb_mode_paiement.create({
      data: {
        libelle: data.libelle,
        user_id: userId ?? 0,
      },
    })
  }
  findAll() {
    return this.prisma.tb_mode_paiement.findMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} entreprise`;
  }


  async update(id: number, data: UpdateModePaiementDto) {
    return this.prisma.tb_mode_paiement.update({
      where: { id: Number(id) },
      data,
    })
  }
  async delete(id: number) {
    return this.prisma.tb_mode_paiement.delete({
      where: { id: Number(id) },
    })
  }
}
