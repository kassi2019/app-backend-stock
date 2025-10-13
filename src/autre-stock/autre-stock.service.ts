import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutreStockService {
    private readonly logger = new Logger(AutreStockService.name);

    constructor(private readonly prisma: PrismaService) { }

    // Vérifie tous les jours à minuit
    @Cron(CronExpression.EVERY_5_SECONDS)
    //@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async verifierLotsExpires() {
        this.logger.log('⏰ Vérification des lots expirés...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1️⃣ Trouver les lots expirés aujourd’hui
        const lotsExpires = await this.prisma.tb_produit_lot.findMany({

            where: {
                statut_inventaire: 1,
                expiration_date: today,
            },
        });

        if (lotsExpires.length === 0) {
            this.logger.log('✅ Aucun lot expiré aujourd’hui.');
            return;
        }

        this.logger.log(`⚠️ ${lotsExpires.length} lot(s) expiré(s) trouvé(s).`);

        for (const lot of lotsExpires) {
            // Vérifie si déjà inséré dans tb_autre_stock
            const existe = await this.prisma.tb_autre_stock.findFirst({
                where: {
                    lot_produit_id: lot.id,
                },
            });

            if (!existe && lot.statut_inventaire === 1) {
                await this.prisma.tb_autre_stock.create({
                    data: {
                        produit_id: lot.produit_id,
                        lot_produit_id: lot.id,
                        quantite: lot.quantite, // ou autre champ selon besoin
                        user_id: 1, // Remplacez 1 par l'ID utilisateur approprié
                        mouvement_id: 5,
                        statut:"0"
                    },
                });
                if (lot.statut_inventaire === 1) {
                    await this.prisma.tb_produit_lot.update({
                        where: { id: lot.id },
                        data: { statut_inventaire: 5 },
                    });
                }
                // Optionnel : marquer le lot comme expiré
                // await this.prisma.tb_produit_lot.update({
                //     where: { id: lot.id },
                //     data: { statut_inventaire: 5 },
                // });

                this.logger.log(
                    `📦 Lot ${lot.id} (produit ${lot.produit_id}) transféré dans autre stock.`,
                );
            }
        }

        this.logger.log('🏁 Vérification terminée.');
    }



    // cette fonction permet de modifier la table autre stock en mettant mouvement a 6 
    async modifierMouvement(id: number) {
        return await this.prisma.tb_autre_stock.update({
            where: { id: Number(id) },
            data: { mouvement_id: 6 },
        });
    }
}
