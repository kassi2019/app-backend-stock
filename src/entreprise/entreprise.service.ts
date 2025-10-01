import { Injectable } from '@nestjs/common';
import { CreateEntrepriseDto } from './dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EntrepriseService {
  [x: string]: any;
  constructor(private readonly prisma: PrismaService) { }
  async create(data: CreateEntrepriseDto, userId?: number) {
    return this.prisma.tb_fournisseur.create({
      data: {
        nom_fournisseur: data.nom_fournisseur,
        telephone: data.telephone,
        type_fournisseur_id: Number(data.type_fournisseur_id),
        user_id: userId ?? 0,
      },
    })
  }
  findAll() {
    return this.prisma.tb_fournisseur.findMany()
  }

  findOne(id: number) {
    return `This action returns a #${id} entreprise`;
  }


  async update(id: number, data: UpdateEntrepriseDto) {
    return this.prisma.tb_fournisseur.update({
      where: { id: Number(id) },
      data,
    })
  }
  async delete(id: number) {
    return this.prisma.tb_fournisseur.delete({
      where: { id: Number(id) },
    })
  }




  async listeFournisseurParCatgorie() {
    const lots = await this.prisma.tb_fournisseur.findMany({

      include: {
        tb_type_fournisseur: true,
      },
    });

    if (!lots || lots.length === 0) {
      return [];
    }

    // On regroupe les lots par produit
    const produitsMap = new Map();

    lots.forEach((lot) => {
      const produitId = lot.type_fournisseur_id;

      if (!produitsMap.has(produitId)) {
        produitsMap.set(produitId, {
          produit: lot.tb_type_fournisseur,
          lots: [],
        });
      }

      produitsMap.get(produitId).lots.push({
        nom_fournisseur: lot.nom_fournisseur,
        telephone: lot.telephone,
        type_fournisseur_id: lot.type_fournisseur_id,
        id: lot.id,

      });
    });

    return Array.from(produitsMap.values());
  }
}
