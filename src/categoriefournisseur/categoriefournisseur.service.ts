import { Injectable } from '@nestjs/common';
import { CreateCategoriefournisseurDto } from './dto/create-categoriefournisseur.dto';
import { UpdateCategoriefournisseurDto } from './dto/update-categoriefournisseur.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class CategoriefournisseurService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService, // ✅ Injection du logger
    ) { }

    async create(data: CreateCategoriefournisseurDto, userId?: number) {
        try {
            const result = await this.prisma.tb_categorie_fournisseur.create({
                data: {
                    libelle: data.libelle,
                    user_id: userId ?? 0,
                },
            });
            this.logger.log(`Création mouvement ID ${result.id}`, 'mouvement'); // ✅ log dans logs/mouvement/YYYY-MM-DD.log
            return result;
        } catch (error) {
            //this.logger.error(`Erreur création catégorie fournisseur: ${error.message}`, error.stack, 'CategoriefournisseurService');
            throw error;
        }
    }

    async findAll() {
        this.logger.log('Récupération de toutes les catégories fournisseurs', 'CategoriefournisseurService');
        return this.prisma.tb_categorie_fournisseur.findMany();
    }

    async findOne(id: number) {
        this.logger.log(`Récupération catégorie fournisseur ID ${id}`, 'CategoriefournisseurService');
        return this.prisma.tb_categorie_fournisseur.findUnique({ where: { id: Number(id) } });
    }

    async update(id: number, data: UpdateCategoriefournisseurDto) {
        try {
            const result = await this.prisma.tb_categorie_fournisseur.update({
                where: { id: Number(id) },
                data,
            });
            this.logger.log(`Modification catégorie fournisseur ID ${id}`, 'CategoriefournisseurService');
            return result;
        } catch (error) {
            //this.logger.error(`Erreur modification catégorie fournisseur ID ${id}: ${error.message}`, error.stack, 'CategoriefournisseurService');
            throw error;
        }
    }

    async delete(id: number) {
        try {
            const result = await this.prisma.tb_categorie_fournisseur.delete({
                where: { id: Number(id) },
            });
            this.logger.log(`Suppression catégorie fournisseur ID ${id}`, 'CategoriefournisseurService');
            return result;
        } catch (error) {
            //this.logger.error(`Erreur suppression catégorie fournisseur ID ${id}: ${error.message}`, error.stack, 'CategoriefournisseurService');
            throw error;
        }
    }
}
