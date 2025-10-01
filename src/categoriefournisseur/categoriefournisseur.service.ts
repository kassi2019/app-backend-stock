import { Injectable } from '@nestjs/common';
import { CreateCategoriefournisseurDto } from './dto/create-categoriefournisseur.dto';
import { UpdateCategoriefournisseurDto } from './dto/update-categoriefournisseur.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriefournisseurService {
  [x: string]: any;
  constructor(private readonly prisma: PrismaService) { }
  async create(data: CreateCategoriefournisseurDto, userId?: number) {
    return this.prisma.tb_categorie_fournisseur.create({
      data: {
        libelle: data.libelle,
        user_id: userId ?? 0,
      },
    })
  }
  findAll() {
    return this.prisma.tb_categorie_fournisseur.findMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} entreprise`;
  }


  async update(id: number, data: UpdateCategoriefournisseurDto) {
    return this.prisma.tb_categorie_fournisseur.update({
      where: { id: Number(id) },
      data,
    })
  }
  async delete(id: number) {
    return this.prisma.tb_categorie_fournisseur.delete({
      where: { id: Number(id) },
    })
  }
}
