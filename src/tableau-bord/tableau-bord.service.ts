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

    // 🧮 1. Produits déjà expirés
    const dejaExpirer = await this.prisma.tb_produit_lot.aggregate({
      where: {
        statut_inventaire: 5,
        expiration_date: { lt: aujourdHui },
      },
      _sum: { quantite: true },
    });

    // 🧮 2. Produits expirant dans les 30 jours
    const bientotExpirer = await this.prisma.tb_produit_lot.aggregate({
      where: {
        expiration_date: {
          gte: aujourdHui, // pas encore expirés
          lte: dans30Jours, // mais vont expirer bientôt
        },
      },
      _sum: { quantite: true },
    });

    const quantiteDejaExpirer = dejaExpirer._sum.quantite ?? 0;
    const quantiteBientotExpirer = bientotExpirer._sum.quantite ?? 0;
    const totalAlerteExpiration = quantiteDejaExpirer + quantiteBientotExpirer;

    // ✅ Retourne un objet structuré
    return {
      quantiteDejaExpirer,
      quantiteBientotExpirer,
      totalAlerteExpiration,
    };
  }





  async getQuantiteRenteeParMois() {
    const result = await this.prisma.$queryRawUnsafe<
      { mois: bigint; quantite_totale: bigint }[]
    >(`
  SELECT 
    EXTRACT(MONTH FROM created_at) AS mois,
    SUM(quantite) AS quantite_totale
  FROM tb_produit_lot
  GROUP BY EXTRACT(MONTH FROM created_at)
  ORDER BY mois ASC
`);

    // 🔄 Conversion BigInt → Number
    const cleanResult = result.map((r) => ({
      mois: Number(r.mois),
      quantite_totale: Number(r.quantite_totale),
    }));

    // Liste des mois abrégés en français
    const moisLabels = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];


    // 🧩 Reformater les données pour le frontend
    const data = moisLabels.map((label, index) => {
      const moisData = cleanResult.find((r) => r.mois === index + 1);

      return {
        mois: label,
        qte_rentre: moisData ? moisData.quantite_totale : 0,
      };
    });

    return data;

  }



  async getPertesEtExpirations() {
  const result = await this.prisma.$queryRawUnsafe<
    { libelle: string; pertes: number; expiration: number }[]
  >(`
    SELECT 
      p.libelle,
      COALESCE(SUM(CASE WHEN a.movement_id = 6 THEN a.quantite END), 0) AS pertes,
      COALESCE(SUM(CASE WHEN a.movement_id = 5 THEN a.quantite END), 0) AS expiration
    FROM tb_produit p
    LEFT JOIN tb_autre_stock a ON p.id = a.produit_id
    GROUP BY p.libelle
    ORDER BY p.libelle ASC
  `);

  // Convertir les BigInt éventuels en nombres JS
  const data = result.map((r) => ({
    produit: r.libelle,
    pertes: Number(r.pertes) || 0,
    expiration: Number(r.expiration) || 0,
  }));

  return data;
}
}