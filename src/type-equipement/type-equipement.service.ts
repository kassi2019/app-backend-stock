import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeEquipementDtoCreate, TypeEquipementDtoUpdate } from './dtos/typeEquipementDto';

@Injectable()
export class TypeEquipementService {
    [x: string]: any;
    constructor(private readonly prisma: PrismaService) { }

    // afficher tout les type d'équipements
    async findAll() {
        return this.prisma.tb_type_equipements.findMany()
    }

    // créer un type d'équipement
    async create(data: TypeEquipementDtoCreate, userId?: number) {
        return this.prisma.tb_type_equipements.create({
            data: {
                libelle: data.libelle,
                user_id: userId ?? 0,
            },
        })
    }

    // modifier un type d'équipement
    async update(id: number, data: TypeEquipementDtoUpdate) {
        return this.prisma.tb_type_equipements.update({
            where: { id: Number(id) },
            data,
        })
    }


    // supprimer un type d'équipement
    async delete(id: number) {
        return this.prisma.tb_type_equipements.delete({
            where: { id: Number(id) },
        })
    }
    async findOne(id: number) {
        return this.prisma.tb_type_equipements.findUnique({
            where: { id: Number(id) },
        })
    }
}
