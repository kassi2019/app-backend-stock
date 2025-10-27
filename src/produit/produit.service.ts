import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProduitDtoCreate, ProduitDtoUpdate, ProduitLotDtoCreate } from './dtos/produitDto';
import { ProduitGateway } from './produit.gateway';

@Injectable()
export class ProduitService {

    [x: string]: any;
    constructor(private readonly prisma: PrismaService,
        private readonly produitGateway: ProduitGateway, // 👈 injecter le gateway
    ) { }

    async create(data: ProduitDtoCreate, userId: number) {
        // Vérifier unicité du code_barre
        // const exist = await this.prisma.tb_produit.findUnique({
        //     where: { code_barre: data.code_barre },
        // });
        // if (exist) {
        //     throw new ConflictException('Ce code-barres existe déjà');
        // }
        return this.prisma.tb_produit.create({
            data: {
                code: data.code,
                code_barre: data.code_barre,
                libelle: data.libelle,
                unitaire: data.unitaire,
                user_id: userId ?? 0,
                prix_unitaire: Number(data.prix_unitaire) ?? 0,
            },
        });
    }

    async update(id: number, data: ProduitDtoUpdate, userId: number) {
        return this.prisma.tb_produit.update({
            where: { id: Number(id) },
            data: {
                code: data.code,
                code_barre: data.code_barre,
                libelle: data.libelle,
                unitaire: data.unitaire,
                user_id: userId ?? 0,
                prix_unitaire: Number(data.prix_unitaire) ?? 0,
            },
        });
    }
    async ajouterCodeBarre(codeProd: string, data: ProduitDtoUpdate, userId: number) {

        const idProduit = await this.prisma.tb_produit.findFirst({
            where: { code: String(codeProd) },
        });
        return this.prisma.tb_produit.update({

            where: { id: Number(idProduit?.id) },
            data: {
                code_barre: data.code_barre,
                user_id: userId ?? 0,

            },
        });
    }

    async verificationCodeProduit(code_produit: string) {

        const codeVerifier = await this.prisma.tb_produit.findFirst({
            where: { code: String(code_produit) },
        });
        if (codeVerifier) {
            return 1
        }
        return 0
    }
    async delete(id: number) {
        return this.prisma.tb_produit.delete({
            where: { id: Number(id) },
        })
    }

    async findOne(id: number) {
        return this.prisma.tb_produit.findUnique({
            where: { id: Number(id) },
        })
    }

    async findAll() {
        return this.prisma.tb_produit.findMany();
    }

    async findByCodeBarre(code_barre: string) {
        const product = await this.prisma.tb_produit.findUnique({
            where: { code_barre },
        });
        if (!product) {
            return "";
        }
        return product;
    }




    async AfficherNombreDeLotParProduit(code_barre: string) {

        const idProduit = await this.prisma.tb_produit.findFirst({
            where: { code_barre: String(code_barre) },
        });

        if (!idProduit) {
            return 0;
        }
        const lot = await this.prisma.tb_produit_lot.findMany({
            where: { produit_id: Number(idProduit?.id) },
        });
        return lot.length
    }

    async AfficherNombreDeLotParProduitId(id_prod: number) {

        const idProduit = await this.prisma.tb_produit.findFirst({
            where: { id: Number(id_prod) },
        });

        if (!idProduit) {
            return 0;
        }
        const lot = await this.prisma.tb_produit_lot.findMany({
            where: { produit_id: Number(idProduit?.id) },
        });
        return lot.length
    }


    async AfficherQuantiteParProduitid(id_prod: number) {
        const produit = await this.prisma.tb_produit.findFirst({
            where: { id: Number(id_prod) },
            include: {
                tb_produit_lot: {
                    select: { quantite: true },
                },
                tb_vente_detail: {
                    select: { quantite: true },
                },
            },
        });

        if (!produit) return 0;

        const sommeLots = produit.tb_produit_lot.reduce(
            (acc, lot) => acc + Number(lot.quantite || 0),
            0,
        );

        const sommeMouvements = produit.tb_vente_detail.reduce(
            (acc, mvt) => acc + Number(mvt.quantite || 0),
            0,
        );

        return sommeLots - sommeMouvements;
    }
    // afficher quantite initial et actual par produit
    async AfficherQuantiteParProduit(code_barre: string) {
        const produit = await this.prisma.tb_produit.findFirst({
            where: { code_barre },
            include: {
                tb_produit_lot: {
                    select: { quantite: true },
                },
                tb_vente_detail: {
                    select: { quantite: true },
                },
            },
        });

        if (!produit) return 0;

        const sommeLots = produit.tb_produit_lot.reduce(
            (acc, lot) => acc + Number(lot.quantite || 0),
            0,
        );

        const sommeMouvements = produit.tb_vente_detail.reduce(
            (acc, mvt) => acc + Number(mvt.quantite || 0),
            0,
        );

        return sommeLots - sommeMouvements;
    }



    async enregistrerProduitStock(
        codeProd: string,
        codeBarre: string,
        data: ProduitDtoUpdate,
        data1: ProduitLotDtoCreate,
        userId: number
    ) {
        const produit = await this.prisma.tb_produit.findFirst({
            where: { code: String(codeProd) },
        });

        if (!produit) {
            throw new Error(`Produit avec code ${codeProd} introuvable`);
        }

        // Vérifier si le code_barre existe déjà
        const produitAvecCodeBarre = await this.prisma.tb_produit.findFirst({
            where: { code_barre: String(codeBarre) },
        });
        let updatedProduit: any = produit;
        // Si aucun produit avec ce code_barre, on met à jour le produit courant
        if (!produitAvecCodeBarre?.code_barre) {
            const updatedProduit = await this.prisma.tb_produit.update({
                where: { id: produit.id },
                data: {
                    code_barre: data.code_barre,
                    user_id: userId ?? 0,
                },
            });
            // 🚀 Notifier en temps réel les clients web
            this.produitGateway.notifyProduitUpdated(updatedProduit);
        }
        // const expirationDate = data1.expiration_date?.trim();
        // const dateProduit = expirationDate
        //     ? new Date(expirationDate).toISOString().split("T")[0]
        //     : null;


        const expirationDateStr = data1.expiration_date; // exemple depuis le frontend
        const expirationDate = expirationDateStr
            ? new Date(`${expirationDateStr}T00:00:00.000Z`)
            : null;
        // Dans tous les cas, on ajoute un lot
        const lot = await this.prisma.tb_produit_lot.create({
            data: {
                produit_id: produit.id,
                code_lot: data1.code_lot,
                expiration_date: expirationDate,
                quantite: Number(data1.quantite),
                prix_achat: Number(data1.prix_achat),
                user_id: userId ?? 0,
                user_respo_id: userId ?? 0, // Ajout de la propriété obligatoire
                fournisseur_id: Number(data1.fournisseur_id),
            },
        });
        return { produit: updatedProduit, lot };
    }





    async afficheListeLotParProduit(idProduit: string) {
        const lots = await this.prisma.tb_produit_lot.findMany({
            where: { produit_id: Number(idProduit) },
            include: {
                tb_produit: true,
            },
        });

        if (!lots || lots.length === 0) {
            return null; // ou {}
        }

        return {
            produit: lots[0].tb_produit, // même produit pour tous les lots
            lots: lots.map((lot) => ({
                code_lot: lot.code_lot,
                expiration_date: lot.expiration_date,
                quantite: lot.quantite,
                prix_achat: lot.prix_achat,
                id: lot.id,
                idProduit: lot.produit_id
            })),
        };
    }


    async sommeQuantiteParProduit(idProduit: string) {
        const result = await this.prisma.tb_produit_lot.aggregate({
            where: { produit_id: Number(idProduit) },
            _sum: { quantite: true },
        });

        return result._sum.quantite || 0;
    }

    async sommePrixAchatParProduit(idProduit: string) {
        const result = await this.prisma.tb_produit_lot.aggregate({
            where: { produit_id: Number(idProduit) },
            _sum: { prix_achat: true },
        });

        return result._sum.prix_achat || 0;
    }


    async updateLotProduit(id: number, data: ProduitLotDtoCreate, userId: number) {
        return this.prisma.tb_produit_lot.update({
            where: { id: Number(id) },
            data: {
                code_lot: data.code_lot,
                quantite: Number(data.quantite),
                expiration_date: data.expiration_date,
                user_id: userId ?? 0,
                prix_achat: Number(data.prix_achat) ?? 0,
                produit_id: data.produit_id

            },
        });
    }




    async enregistrerProduitSortantProvisoire(
        codeBarre: string,
        userId: number
    ) {
        const produit = await this.prisma.tb_produit.findFirst({
            where: { code_barre: String(codeBarre) },
        });

        if (!produit) {
            throw new Error(`Produit avec code ${codeBarre} introuvable`);
        }


        // Dans tous les cas, on ajoute un lot
        const lot = await this.prisma.tb_stock_temporel.create({
            data: {
                produit_id: produit.id,
                statut: 0,
                user_id: userId ?? 0,
            },
        });
        this.produitGateway.notifyProduitStockTemporelUpdated(lot);
        return lot;
    }


    async afficheListeProduitPourSortie(userId: number) {
        const lots = await this.prisma.tb_stock_temporel.findMany({
            where: {
                user_id: Number(userId),
                statut: 0,
                created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
            include: {
                tb_produit: {
                    include: {
                        tb_produit_lot: {
                            where: { statut_inventaire: 1 }, // filtre côté Prisma
                        },
                        tb_vente_detail: true,
                    },
                },

            },
        });

        const lotsAvecSomme = lots.map((lot) => {
            const totalQuantite = lot.tb_produit.tb_produit_lot.reduce(
                (acc, lp) => acc + (lp.quantite || 0),
                0
            );

            const venduQuantite = lot.tb_produit.tb_vente_detail.reduce(
                (acc, vd) => acc + (vd.quantite || 0),
                0
            );

            return {
                ...lot,
                totalQuantite,
                venduQuantite,
                resteDisponible: totalQuantite - venduQuantite,
            };
        });

        return lotsAvecSomme;
    }





    async afficheListeLotParProduitInventaire() {
        const lots = await this.prisma.tb_produit_lot.findMany({
            where: { statut_inventaire: 0 },
            include: {
                tb_produit: true,
                users: true,
            },
        });

        if (!lots || lots.length === 0) {
            return [];
        }

        // On regroupe les lots par produit
        const produitsMap = new Map();

        lots.forEach((lot) => {
            const produitId = lot.produit_id;

            if (!produitsMap.has(produitId)) {
                produitsMap.set(produitId, {
                    produit: lot.tb_produit,
                    lots: [],
                });
            }

            produitsMap.get(produitId).lots.push({
                code_lot: lot.code_lot,
                expiration_date: lot.expiration_date,
                quantite: lot.quantite,
                prix_achat: lot.prix_achat,
                id: lot.id,
                idProduit: lot.produit_id,
                user: lot.users,
            });
        });

        return Array.from(produitsMap.values());
    }



    async mettreAJourQuantiteTheorique(lotId: number, quantiteLot: number, userId: number) {

        // Récupérer le lot actuel
        const lot = await this.prisma.tb_produit_lot.findUnique({
            where: { id: Number(lotId) },
        });

        if (!lot) {
            throw new Error('Lot non trouvé');
        }

        // Déterminer le statut_inventaire
        const statut_inventaire = lot.quantite === Number(quantiteLot) ? 1 : 2;

        // Mettre à jour le lot
        const produitlot = await this.prisma.tb_produit_lot.update({
            where: { id: Number(lotId) },
            data: {
                quantite_theorique: Number(quantiteLot),
                statut_inventaire: Number(statut_inventaire),
                user_respo_id: userId ?? 0,
            },
        });

        this.produitGateway.notifyProduitStockTemporelUpdated(produitlot);
        this.produitGateway.notificationAutreStock(this.prisma.tb_autre_stock);
        this.produitGateway.notificationTableAutreStock(this.prisma.tb_produit_lot, this.prisma.tb_vente_detail);
        return produitlot;
    }





    async afficheListeLotParProduitValide() {
        const lots = await this.prisma.tb_produit_lot.findMany({
            where: { statut_inventaire: 1 },
            include: {
                tb_produit: true,
                users: true,
            },
        });

        if (!lots || lots.length === 0) {
            return [];
        }

        // On regroupe les lots par produit
        const produitsMap = new Map();

        lots.forEach((lot) => {
            const produitId = lot.produit_id;

            if (!produitsMap.has(produitId)) {
                produitsMap.set(produitId, {
                    produit: lot.tb_produit,
                    lots: [],
                });
            }

            produitsMap.get(produitId).lots.push({
                code_lot: lot.code_lot,
                expiration_date: lot.expiration_date,
                quantite: lot.quantite,
                prix_achat: lot.prix_achat,
                quantite_theorique: lot.quantite_theorique,
                id: lot.id,
                idProduit: lot.produit_id,
                user: lot.users,
            });
        });

        return Array.from(produitsMap.values());
    }


    async RamenerQuantiteTheorique(lotId: number, userId: number) {

        // Récupérer le lot actuel
        const lot = await this.prisma.tb_produit_lot.findUnique({
            where: {
                id: Number(lotId),
                user_respo_id: Number(userId)
            },
        });

        if (!lot) {
            throw new Error('Lot non trouvé');
        }
        // Mettre à jour le lot
        return await this.prisma.tb_produit_lot.update({
            where: { id: Number(lotId) },
            data: {
                quantite_theorique: Number(0),
                statut_inventaire: Number(0),
                user_respo_id: userId ?? 0,
            },
        });
    }


    async enregistrerProduitStockSansCodeBarre(data: ProduitLotDtoCreate, userId?: number) {
        const expirationDateStr = data.expiration_date; // exemple depuis le frontend
        const expirationDate = expirationDateStr
            ? new Date(`${expirationDateStr}T00:00:00.000Z`)
            : null;
        return this.prisma.tb_produit_lot.create({
            data: {
                produit_id: Number(data.produit_id),
                code_lot: data.code_lot,
                expiration_date: expirationDate,
                quantite: Number(data.quantite),
                prix_achat: Number(data.prix_achat),
                user_id: userId ?? 0,
                user_respo_id: userId ?? 0, // Ajout de la propriété obligatoire
                fournisseur_id: Number(data.fournisseur_id),
            },
        })
    }
}



