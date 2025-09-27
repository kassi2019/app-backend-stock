import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeMouvementDtoCreate, TypeMouvementDtoUpdate } from './dtos/typeMouvementDto';

@Injectable()
export class TypeMouvementService {
    [x: string]: any;
    constructor(private readonly prisma: PrismaService) { }

    // afficher tout les type de mouvements
    async findAll() {
        return this.prisma.tb_type_mouvement.findMany()
    }

    // créer un type de mouvement
    async create(data: TypeMouvementDtoCreate, userId?: number) {
        return this.prisma.tb_type_mouvement.create({
            data: {
                libelle: data.libelle,
                user_id: userId ?? 0,
            },
        })
    }

    // modifier un type de mouvement
    async update(id: number, data: TypeMouvementDtoUpdate) {
        return this.prisma.tb_type_mouvement.update({
            where: { id: Number(id) },
            data,
        })
    }


    // supprimer un type de mouvement
    async delete(id: number) {
        return this.prisma.tb_type_mouvement.delete({
            where: { id: Number(id) },
        })
    }
    async findOne(id: number) {
        return this.prisma.tb_type_mouvement.findUnique({
            where: { id: Number(id) },
        })
    }
}
