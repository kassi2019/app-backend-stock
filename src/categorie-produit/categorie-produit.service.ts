import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategorieProduitDtoCreate, CategorieProduitDtoUpdate } from './dtos/categorieProduitDto';
@Injectable()
export class CategorieProduitService {
    [x: string]: any;
    constructor(private readonly prisma: PrismaService) { }

    // afficher tout les type de mouvements
    async findAll() {
        return this.prisma.tb_categorie_produit.findMany()
    }

    // créer un type de mouvement
    async create(data: CategorieProduitDtoCreate, userId?: number) {
        return this.prisma.tb_categorie_produit.create({
            data: {
                libelle: data.libelle,
                user_id: userId ?? 0,
            },
        })
    }

    // modifier un type de mouvement
    async update(id: number, data: CategorieProduitDtoUpdate) {
        return this.prisma.tb_categorie_produit.update({
            where: { id: Number(id) },
            data,
        })
    }


    // supprimer un type de mouvement
    async delete(id: number) {
        return this.prisma.tb_categorie_produit.delete({
            where: { id: Number(id) },
        })
    }
    async findOne(id: number) {
        return this.prisma.tb_categorie_produit.findUnique({
            where: { id: Number(id) },
        })
    }
}
