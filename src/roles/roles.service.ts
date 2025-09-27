import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleDtoCreate, RoleDtoUpdate } from './dtos/roleDto';

@Injectable()
export class RolesService {
    constructor(private readonly prisma: PrismaService) { }

    // créer un role
    async create(data: RoleDtoCreate, userId?: number) {
        // Vérification si un niveau identique existe déjà
        const existing = await this.prisma.tb_roles.findFirst({
          where: { code: data.code },
        });
    
        if (existing) {
          throw new BadRequestException('Ce code existe déjà.');
        }
    
        // Création si le niveau n'existe pas
        return this.prisma.tb_roles.create({
          data: {
            code: data.code,
            libelle: data.libelle,
            user_id: userId ?? 0,
          },
        });
    }
    // modifier un role
    async update(id: number, data: RoleDtoUpdate) {
        return this.prisma.tb_roles.update({
            where: { id: Number(id) },
            data,
        })
    }
    // supprimer un role
    async delete(id: number) {
        return this.prisma.tb_roles.delete({
            where: { id: Number(id) },
        })
    }
    // afficher un role 
    async findOne(id: number) {
        return this.prisma.tb_roles.findUnique({
            where: { id: Number(id) },
        })
    }
    // afficher tous les roles
    async findAll() {
        return this.prisma.tb_roles.findMany();
    }
}
