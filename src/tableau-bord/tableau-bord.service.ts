import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProduitGateway } from '../produit/produit.gateway';
@Injectable()
export class TableauBordService {


  [x: string]: any;
  constructor(private readonly prisma: PrismaService,
    private readonly produitGateway: ProduitGateway,
  ) { }
  // affichier la quantite disponible dans notre stock

  async AfficherQuantiteDisponible() {
    const quantiteDisponible = await this.prisma.tb_produit_lot.aggregate({
      where: { statut_inventaire: 1 },
      _sum: { quantite_theorique: true },
    });

    const detailVente = await this.prisma.tb_vente_detail.aggregate({
      _sum: { quantite: true },
    });

    const autreStock = await this.prisma.tb_autre_stock.aggregate({
      _sum: { quantite: true },
    });

    // Valeurs sécurisées (si null → 0)
    const quantiteDisponibleInitial = quantiteDisponible._sum.quantite_theorique ?? 0;
    const quantiteVendu = detailVente._sum.quantite ?? 0;
    const quantiteAutreStock = autreStock._sum.quantite ?? 0;


    if (quantiteDisponibleInitial === 0) {
      return {
        quantiteDisponibleInitial,
        quantiteVendu,
        quantiteAutreStock,
        quantiteDisponibleFinal: 0,
      };
    }
    const quantiteDisponibleFinal =
      quantiteDisponibleInitial - (quantiteVendu + quantiteAutreStock);


    const result = {
      quantiteDisponibleInitial,
      quantiteVendu,
      quantiteAutreStock,
      quantiteDisponibleFinal,
    };

    // 🔥 émettre la mise à jour en temps réel
    this.produitGateway.envoyerMaj(result);

    return result;
    // ✅ Retourne un objet structuré pour l’API
    // return {
    //   quantiteDisponibleInitial,
    //   quantiteVendu,
    //   quantiteAutreStock,
    //   quantiteDisponibleFinal,
    // };
  }



  // afficher quantite en attente de validation lorsque statut inventaire est 0

  async AfficherQuantiteEnAttente() {
    const quantiteEnAttente = await this.prisma.tb_produit_lot.aggregate({
      where: { statut_inventaire: 0 },
      _sum: { quantite: true },
    });
    const totalAttente = quantiteEnAttente._sum.quantite || 0;
    return {
      totalAttente
    }
  }


  // afficher quantite  valide lorsque statut inventaire est 1

  async AfficherQuantiteValide() {
    const quantiteValide = await this.prisma.tb_produit_lot.aggregate({
      where: { statut_inventaire: 1 },
      _sum: { quantite: true },
    });

    return quantiteValide._sum.quantite || 0;
  }


  // afficher quantite qui sont bientot expirer lorsque la date d'expiration moin la date du jour est inferieur ou egal a 30 jours

  async AfficherQuantiteExpirer() {
    const aujourdHui = new Date();
    const dans30Jours = new Date(new Date().setDate(aujourdHui.getDate() + 30));
    const debutJour = new Date(aujourdHui.setHours(0, 0, 0, 0));
    const finJour = new Date(aujourdHui.setHours(23, 59, 59, 999));
    // 🧮 1. Produits déjà expirés
    const dejaExpirer = await this.prisma.tb_produit_lot.aggregate({
      where: {
        statut_inventaire: 5,
        expiration_date: { lt: aujourdHui },
      },
      _sum: { quantite: true },
    });

    // 2. Produits expirant aujourd’hui

    const produitExpirerAujourdhui = await this.prisma.tb_produit_lot.aggregate({
      where: {
        statut_inventaire: 5,
        expiration_date: {
          gte: debutJour,  // >= début du jour
          lte: finJour,    // <= fin du jour
        },
      },
      _sum: { quantite: true },
    });

    // 🧮 3. Produits expirant dans les 30 jours
    const bientotExpirer = await this.prisma.tb_produit_lot.aggregate({
      where: {
        expiration_date: {
          gte: aujourdHui, // pas encore expirés
          lte: dans30Jours, // mais vont expirer bientôt
        },
      },
      _sum: { quantite: true },
    });

    // 3 produit expirant et detruit 
    const produitDetruit = await this.prisma.tb_autre_stock.aggregate({
      where: {
        statut: "1",
      },
      _sum: { quantite: true },
    });
    // 3 produit expirant et non detruit 
    const produitNonDetruit = await this.prisma.tb_autre_stock.aggregate({
      where: {
        statut: "0",
      },
      _sum: { quantite: true },
    });
    const quantiteDejaExpirer = dejaExpirer._sum.quantite ?? 0;
    const quantiteBientotExpirer = bientotExpirer._sum.quantite ?? 0;
    const quantiteDetruit = produitDetruit._sum.quantite ?? 0;
    const quantiteNonDetruit = produitNonDetruit._sum.quantite ?? 0;
    const quantiteExpirerAujourdhui = produitExpirerAujourdhui._sum.quantite ?? 0;
    const totalAlerteExpiration = quantiteDejaExpirer + quantiteBientotExpirer;


    // ✅ Retourne un objet structuré
    return {
      quantiteDejaExpirer,
      quantiteBientotExpirer,
      quantiteDetruit,
      totalAlerteExpiration,
      quantiteExpirerAujourdhui,
      quantiteNonDetruit
    };
  }





  async getQuantiteRenteeParMois() {
    const result = await this.prisma.$queryRawUnsafe<
      { mois: number; qte_rentree: number; qte_sortie: number }[]
    >(`
    SELECT 
      mois,
      COALESCE(SUM(qte_rentree), 0) AS qte_rentree,
      COALESCE(SUM(qte_sortie), 0) AS qte_sortie
    FROM (
      -- 🟢 Quantités rentrées (provenant de tb_produit_lot)
      SELECT 
        EXTRACT(MONTH FROM pl.created_at) AS mois,
        SUM(pl.quantite) AS qte_rentree,
        0 AS qte_sortie
      FROM tb_produit_lot pl
      GROUP BY EXTRACT(MONTH FROM pl.created_at)

      UNION ALL

      -- 🔵 Quantités vendues (provenant de vendu_detail)
      SELECT 
        EXTRACT(MONTH FROM v.created_at) AS mois,
        0 AS qte_rentree,
        SUM(v.quantite) AS qte_sortie
      FROM tb_vente_detail v
      GROUP BY EXTRACT(MONTH FROM v.created_at)

      UNION ALL

      -- 🔴 Quantités expirées (provenant de autre_stock)
      SELECT 
        EXTRACT(MONTH FROM a.created_at) AS mois,
        0 AS qte_rentree,
        SUM(a.quantite) AS qte_sortie
      FROM tb_autre_stock a
      -- WHERE a.mouvement_id = 5  -- facultatif : si tu veux seulement les expirations
      GROUP BY EXTRACT(MONTH FROM a.created_at)
    ) AS total
    GROUP BY mois
    ORDER BY mois ASC;
  `);

    // 🧹 Conversion BigInt → Number
    const cleanResult = result.map((r) => ({
      mois: Number(r.mois),
      qte_rentree: Number(r.qte_rentree),
      qte_sortie: Number(r.qte_sortie),
    }));

    // 📅 Mois abrégés en français
    const moisLabels = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];

    // 🧩 Reformater pour le frontend
    const data = moisLabels.map((label, index) => {
      const moisData = cleanResult.find((r) => r.mois === index + 1);

      return {
        mois: label,
        qte_rentree: moisData ? moisData.qte_rentree : 0,
        qte_sortie: moisData ? moisData.qte_sortie : 0,
      };
    });

    return data;
  }





async getPertesEtExpirations() {
  const result = await this.prisma.$queryRawUnsafe<
    { libelle: string; qte_pertes: number; qte_expiration: number; qte_initial: number; qte_vendue: number }[]
  >(`
    SELECT 
      p.libelle,
      COALESCE(pertes.qte_pertes, 0) AS qte_pertes,
      COALESCE(init.qte_initial, 0) AS qte_initial,
      COALESCE(expir.qte_expiration, 0) AS qte_expiration,
      COALESCE(vendus.qte_vendue, 0) AS qte_vendue
    FROM tb_produit p

    -- 🔴 pertes
    LEFT JOIN (
      SELECT produit_id, SUM(quantite) AS qte_pertes
      FROM tb_autre_stock
      WHERE mouvement_id = 4
      GROUP BY produit_id
    ) AS pertes ON p.id = pertes.produit_id

    -- 🟢 initial
    LEFT JOIN (
      SELECT produit_id, SUM(quantite_theorique) AS qte_initial
      FROM tb_produit_lot
      GROUP BY produit_id
    ) AS init ON p.id = init.produit_id

    -- 🟠 expirations
    LEFT JOIN (
      SELECT produit_id, SUM(quantite) AS qte_expiration
      FROM tb_autre_stock
      WHERE mouvement_id = 5
      GROUP BY produit_id
    ) AS expir ON p.id = expir.produit_id

    -- 🔵 ventes
    LEFT JOIN (
      SELECT produit_id, SUM(quantite) AS qte_vendue
      FROM tb_vente_detail
      GROUP BY produit_id
    ) AS vendus ON p.id = vendus.produit_id

    ORDER BY p.libelle ASC;
  `);

  // 🧹 Conversion BigInt → Number
  const data = result.map((r) => ({
    produit: r.libelle,
    qtepertes: Number(r.qte_pertes) || 0,
    qteInitial: Number(r.qte_initial) || 0,
    qteexpiration: Number(r.qte_expiration) || 0,
    qtevendue: Number(r.qte_vendue) || 0,
    qteDisponible: Number(r.qte_initial) - (Number(r.qte_pertes) + Number(r.qte_expiration)+ Number(r.qte_vendue)),
  }));

  return data;
}

}