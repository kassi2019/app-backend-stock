import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MouvementDtoCreate, MouvementDtoUpdate } from './dtos/mouvementDto';
@Injectable()
export class MouvementService {
    [x: string]: any;
    constructor(private readonly prisma: PrismaService) { }

    // afficher les mouvements
    async findAll() {
        return this.prisma.tb_mouvement.findMany()
    }

    // créer un  mouvement
    async create(data: MouvementDtoCreate, userId?: number) {
        return this.prisma.tb_mouvement.create({
            data: {
                libelle: data.libelle,
                type_mouvement_id: Number(data.type_mouvement_id),
                user_id: userId ?? 0,
            },
        })
    }

    // modifier un  mouvement
    async update(id: number, data: MouvementDtoUpdate) {
        return this.prisma.tb_mouvement.update({
            where: { id: Number(id) },
            data,
        })
    }


    // supprimer un  mouvement
    async delete(id: number) {
        return this.prisma.tb_mouvement.delete({
            where: { id: Number(id) },
        })
    }
    async findOne(id: number) {
        return this.prisma.tb_mouvement.findUnique({
            where: { id: Number(id) },
        })
    }
}
