import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class RapportService {

    [x: string]: any;
    constructor(private readonly prisma: PrismaService
    ) { }

    // rapport sur l entree des produit lot
    async rapportEntreeProduitLot(dateDebut: string, dateFin: string) {
        const debut = new Date(`${dateDebut}T00:00:00`);
        const fin = new Date(`${dateFin}T23:59:59`);
        const produits = await this.prisma.tb_produit.findMany({
            include: {
                tb_produit_lot: {
                    where: {
                        created_at: {
                            gte: debut,
                            lte: fin,
                        },
                    },
                    include: {
                        tb_fournisseur: true, // jointure avec la table fournisseur
                        users: true,
                    },
                },
            },
        });

        return produits.map((p) => ({
            id: p.id,
            libelle: p.libelle,
            quantite_totale: p.tb_produit_lot.reduce((sum, lot) => sum + lot.quantite, 0),
            fournisseurs: [
                ...new Set(p.tb_produit_lot.map((lot) => lot.tb_fournisseur?.nom_fournisseur).filter(Boolean)),
            ],
            utilisateurs: [
                ...new Set(p.tb_produit_lot.map((lot) => lot.users?.noms_prenoms).filter(Boolean)),
            ],
            date: p.tb_produit_lot[0]?.created_at
                ? new Date(p.tb_produit_lot[0].created_at).toISOString().split('T')[0]
                : null,
        }));
    }





    // rapport sur les produit sortant
    async rapportQuantiteVendue(dateDebut: string, dateFin: string) {
        const debut = new Date(`${dateDebut}T00:00:00`);
        const fin = new Date(`${dateFin}T23:59:59`);
        const produits = await this.prisma.tb_produit.findMany({
            include: {
                tb_vente_detail: {
                    where: {
                        created_at: {
                            gte: debut,
                            lte: fin,
                        },
                    },
                    // include: {

                    //     users: true,
                    // },
                },
            },
        });

        return produits.map((p) => ({
            id: p.id,
            code: p.code,
            libelle: p.libelle,
            quantite_totale: p.tb_vente_detail.reduce((sum, lot) => sum + lot.quantite, 0),
            montantGlobale: p.tb_vente_detail.reduce((sum, lot) => sum + Number(lot.total), 0),
            // utilisateurs: [
            //     ...new Set(p.tb_vente_detail.map((lot) => lot.users?.noms_prenoms).filter(Boolean)),
            // ],
            date: p.tb_vente_detail[0]?.created_at
                ? new Date(p.tb_vente_detail[0].created_at).toISOString().split('T')[0]
                : null,
        }));
    }





}
