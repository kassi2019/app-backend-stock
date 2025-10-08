import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenteDto } from "./dtos/create-vente.dto";
import { ProduitGateway } from '../produit/produit.gateway';
@Injectable()
export class VenteService {
    constructor(private prisma: PrismaService,
        private readonly produitGateway: ProduitGateway) { }

    // async create(createVenteDto: CreateVenteDto, userId: number) {
    //     const { montant_recu, montant_a_payer, monnaie_rendu, tb_vente_detail } = createVenteDto;

    //     // Optionnel : simple validation côté service
    //     if (montant_recu === undefined) {
    //         throw new Error('montant_recu est requis');
    //     }
    //     if (montant_a_payer === undefined) {
    //         throw new Error('montant_a_payer est requis');
    //     }
    //     if (!Array.isArray(tb_vente_detail) || tb_vente_detail.length === 0) {
    //         throw new Error('details doit être un tableau non vide');
    //     }
    //     return this.prisma.tb_vente.create({
    //         data: {
    //             montant_recu,
    //             montant_a_payer,
    //             monnaie_rendu: monnaie_rendu ?? 0,
    //             user_id: userId ?? null,
    //             tb_vente_detail: {
    //                 create: tb_vente_detail.map((d) => ({
    //                     produit_id: d.produit_id ?? 0,
    //                     quantite: d.quantite ?? 0,
    //                     prix_unitaire: d.prix_unitaire ?? 0,
    //                     total: d.total ?? 0,
    //                     user_id: userId ?? null,
    //                 })),
    //             },
    //         },
    //         include: {
    //             tb_vente_detail: true,
    //         },
    //     });


    // }




    async create(createVenteDto: CreateVenteDto, userId: number) {
        const { montant_recu, montant_a_payer, monnaie_rendu, tb_vente_detail } = createVenteDto;

        // Optionnel : simple validation côté service
        if (montant_recu === undefined) {
            throw new Error('montant_recu est requis');
        }
        if (montant_a_payer === undefined) {
            throw new Error('montant_a_payer est requis');
        }
        if (!Array.isArray(tb_vente_detail) || tb_vente_detail.length === 0) {
            throw new Error('details doit être un tableau non vide');
        }
        // 1️⃣ Créer la vente avec ses détails
        const vente = await this.prisma.tb_vente.create({
            data: {
                montant_recu,
                montant_a_payer,
                monnaie_rendu: monnaie_rendu ?? 0,
                user_id: userId ?? 0,
                tb_vente_detail: {
                    create: tb_vente_detail.map((d) => ({
                        produit_id: d.produit_id ?? 0,
                        quantite: d.quantite ?? 0,
                        prix_unitaire: d.prix_unitaire ?? 0,
                        total: d.total ?? 0,
                        user_id: userId ?? 0,
                        stock_temporel_id: d.stock_temporel_id
                    })),
                },
            },
            include: {
                tb_vente_detail: true,
            },
        });

        // 2️⃣ Récupérer tous les id de stock_temporel à mettre à jour
        const stockTemporelIds = await this.prisma.tb_stock_temporel.findMany({
            where: {
                user_id: Number(userId),
                statut: 0,
                created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
            select: { id: true }, // ne récupère que l'id
        }).then(rows => rows.map(r => r.id));

        // 3️⃣ Mettre à jour le statut de tous les produits
        if (stockTemporelIds.length > 0) {
            const lot = await this.prisma.tb_stock_temporel.updateMany({
                where: { id: { in: stockTemporelIds } },
                data: { statut: 1 },
            });
            this.produitGateway.notifyProduitStockTemporelUpdated(lot);
        }


        return vente;
    }

}
