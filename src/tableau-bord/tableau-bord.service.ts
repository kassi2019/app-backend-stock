import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProduitGateway } from '../produit/produit.gateway';
@Injectable()
export class TableauBordService {


  [x: string]: any;
  constructor(private readonly prisma: PrismaService,
    private readonly produitGateway: ProduitGateway,
  ) { }


  // ******************************* DEBUT DES FONCTIONS DU TABLEAU DE BORD COTE RESPONSABLE DE STOCK*******************************
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
        // statut: "1",
        mouvement_id: 6,
      },
      _sum: { quantite: true },
    });
    // 3 produit expirant et non detruit 
    const produitNonDetruit = await this.prisma.tb_autre_stock.aggregate({
      where: {
        // statut: "0",
        mouvement_id: 7,
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
      { mois: number; qte_rentree: number; qte_vendu: number, qte_perdu: number, qte_expire: number, qte_detruire: number }[]
    >(`
    SELECT 
    mois,
    COALESCE(SUM(qte_rentree), 0) AS qte_rentree,
    COALESCE(SUM(qte_vendu), 0) AS qte_vendu,
    COALESCE(SUM(qte_perdu), 0) AS qte_perdu,
    COALESCE(SUM(qte_expire), 0) AS qte_expire,
    COALESCE(SUM(qte_detruire), 0) AS qte_detruire
FROM (
    -- 🟢 Quantités rentrées (tb_produit_lot)
    SELECT 
        EXTRACT(MONTH FROM pl.created_at) AS mois,
        SUM(pl.quantite) AS qte_rentree,
        0 AS qte_vendu,
        0 AS qte_perdu,
        0 AS qte_expire,
        0 AS qte_detruire
    FROM tb_produit_lot pl
    GROUP BY EXTRACT(MONTH FROM pl.created_at)

    UNION ALL

    -- 🔵 Quantités vendues (tb_vente_detail)
    SELECT 
        EXTRACT(MONTH FROM v.created_at) AS mois,
        0 AS qte_rentree,
        SUM(v.quantite) AS qte_vendu,
        0 AS qte_perdu,
        0 AS qte_expire,
        0 AS qte_detruire
    FROM tb_vente_detail v
    GROUP BY EXTRACT(MONTH FROM v.created_at)

    UNION ALL

    -- 🔴 Quantités perdues (tb_autre_stock)
    SELECT 
        EXTRACT(MONTH FROM p.created_at) AS mois,
        0 AS qte_rentree,
        0 AS qte_vendu,
        SUM(p.quantite) AS qte_perdu,
        0 AS qte_expire,
        0 AS qte_detruire
    FROM tb_autre_stock p
    WHERE p.mouvement_id = 4
    GROUP BY EXTRACT(MONTH FROM p.created_at)
    
    UNION ALL
    
    -- ⚫ Quantités expirées (tb_autre_stock)
    SELECT 
        EXTRACT(MONTH FROM e.created_at) AS mois,
        0 AS qte_rentree,
        0 AS qte_vendu,
        0 AS qte_perdu,
        SUM(e.quantite) AS qte_expire,
        0 AS qte_detruire
    FROM tb_autre_stock e
    WHERE e.mouvement_id = 5
    GROUP BY EXTRACT(MONTH FROM e.created_at)
    
    UNION ALL
    
    -- 🟠 Quantités détruites (tb_autre_stock)
    SELECT 
        EXTRACT(MONTH FROM d.created_at) AS mois,
        0 AS qte_rentree,
        0 AS qte_vendu,
        0 AS qte_perdu,
        0 AS qte_expire,
        SUM(d.quantite) AS qte_detruire
    FROM tb_autre_stock d
    WHERE d.mouvement_id = 6 
    GROUP BY EXTRACT(MONTH FROM d.created_at)
) AS total
GROUP BY mois
ORDER BY mois ASC;

  `);

    // 🧹 Conversion BigInt → Number
    const cleanResult = result.map((r) => ({
      mois: Number(r.mois),
      qte_rentree: Number(r.qte_rentree),
      qte_vendu: Number(r.qte_vendu),
      qte_perdu: Number(r.qte_perdu),
      qte_expire: Number(r.qte_expire),
      qte_detruire: Number(r.qte_detruire),
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
        qte_vendu: moisData ? moisData.qte_vendu : 0,
        qte_perdu: moisData ? moisData.qte_perdu : 0,
        qte_expire: moisData ? moisData.qte_expire : 0,
        qte_detruire: moisData ? moisData.qte_detruire : 0
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
      qteDisponible: Number(r.qte_initial) - (Number(r.qte_pertes) + Number(r.qte_expiration) + Number(r.qte_vendue)),
    }));

    return data;
  }





  async getDetailStockDisponible() {
    const result = await this.prisma.$queryRawUnsafe<
      { produit: string; quantite_initiale: number; quantite_vendue: number; quantite_expiree: number }[]
    >(`
          SELECT 
        p.libelle AS produit,
        COALESCE(pl.total_initial, 0) AS quantite_initiale,
        COALESCE(v.total_vendu, 0) AS quantite_vendue,
        COALESCE(st.total_expire, 0) AS quantite_expiree
      FROM tb_produit p
      LEFT JOIN (
          SELECT produit_id, SUM(quantite_theorique) AS total_initial
          FROM tb_produit_lot
          where statut_inventaire = 1
          GROUP BY produit_id
      ) pl ON pl.produit_id = p.id
      LEFT JOIN (
          SELECT produit_id, SUM(quantite) AS total_vendu
          FROM tb_vente_detail
          GROUP BY produit_id
      ) v ON v.produit_id = p.id
      LEFT JOIN (
          SELECT produit_id, SUM(quantite) AS total_expire
          FROM tb_autre_stock
          GROUP BY produit_id
      ) st ON st.produit_id = p.id
      ORDER BY p.libelle ASC;
  `);
    // if (quantiteDisponibleInitial === 0) {
    //   return {
    //     quantiteDisponibleInitial,
    //     quantiteVendu,
    //     quantiteAutreStock,
    //     quantiteDisponibleFinal: 0,
    //   };
    // }
    // 🧹 Conversion BigInt → Number

    const data = result.map((r) => (
      Number(r.quantite_initiale) === 0
        ? {
          produit: r.produit,
          quantite: 0,
        }
        : {
          produit: r.produit,
          quantite: Number(r.quantite_initiale) - (Number(r.quantite_expiree) + Number(r.quantite_vendue)),
        }
    ));

    return data;
  }




  async getDetailQuantiteAttente() {
    const result = await this.prisma.$queryRawUnsafe<
      { produit: string; quantite_initiale: number }[]
    >(`
          SELECT 
        p.libelle AS produit,
        COALESCE(pl.total_initial, 0) AS quantite_initiale
      FROM tb_produit p
      LEFT JOIN (
          SELECT produit_id, SUM(quantite) AS total_initial
          FROM tb_produit_lot
          where statut_inventaire = 0
          GROUP BY produit_id
      ) pl ON pl.produit_id = p.id
    
      ORDER BY p.libelle ASC;
  `);
    // 🧹 Conversion BigInt → Number
    const data = result.map((r) => ({
      produit: r.produit,
      quantite: Number(r.quantite_initiale),
    }));

    return data;
  }

  // afficher les produits qui vont expirer bientot dans 30 jours

  async getDetailQuantiteBientotExpire() {
    const result = await this.prisma.$queryRawUnsafe<
      { produit: string; quantite_initiale: number }[]
    >(
      `
    SELECT 
      p.libelle AS produit,
      COALESCE(pl.total_initial, 0) AS quantite_initiale
    FROM tb_produit p
    LEFT JOIN (
        SELECT produit_id, SUM(quantite) AS total_initial
        FROM tb_produit_lot
        WHERE expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
        GROUP BY produit_id
    ) pl ON pl.produit_id = p.id
    ORDER BY p.libelle ASC;
  `
    );

    const data = result.map((r) => ({
      produit: r.produit,
      quantite: Number(r.quantite_initiale),
    }));

    return data;
  }

  async getDetailQuantiteExpireAujourdHui() {
    const result = await this.prisma.$queryRawUnsafe<
      { produit: string; quantite_expiree: number }[]
    >(
      `
    SELECT 
      p.libelle AS produit,
      COALESCE(SUM(pl.quantite), 0) AS quantite_expiree
    FROM tb_produit p
    LEFT JOIN tb_produit_lot pl
      ON pl.produit_id = p.id
      AND DATE(pl.expiration_date) = CURDATE()
    GROUP BY p.libelle
    ORDER BY p.libelle ASC;
  `
    );

    // Conversion BigInt → Number
    const data = result.map((r) => ({
      produit: r.produit,
      quantite: Number(r.quantite_expiree),
    }));

    return data;
  }


  async getDetailQuantiteDetruite() {
    const result = await this.prisma.$queryRawUnsafe<
      { produit: string; quantite_expiree: number }[]
    >(
      `
    SELECT 
      p.libelle AS produit,
      COALESCE(SUM(pl.quantite), 0) AS quantite_expiree
    FROM tb_produit p
    LEFT JOIN tb_autre_stock pl
      ON pl.produit_id = p.id
      AND  pl.mouvement_id="6"
    GROUP BY p.libelle
    ORDER BY p.libelle ASC
  `
    );

    // Conversion BigInt → Number
    const data = result.map((r) => ({
      produit: r.produit,
      quantite: Number(r.quantite_expiree),
    }));

    return data;
  }



  async getDetailQuantiteNonDetruite() {
    const result = await this.prisma.$queryRawUnsafe<
      { produit: string; quantite_expiree: number }[]
    >(
      `
    SELECT 
      p.libelle AS produit,
      COALESCE(SUM(pl.quantite), 0) AS quantite_expiree
    FROM tb_produit p
    LEFT JOIN tb_autre_stock pl
      ON pl.produit_id = p.id
      AND pl.mouvement_id="7"
    GROUP BY p.libelle
    ORDER BY p.libelle ASC
  `
    );

    // Conversion BigInt → Number
    const data = result.map((r) => ({
      produit: r.produit,
      quantite: Number(r.quantite_expiree),
    }));

    return data;
  }





  async getEvolutionVenteParJour() {
    const result = await this.prisma.$queryRawUnsafe<
      { jours: number; total_vendu: number; qte_vendu: number }[]
    >(`
    SELECT 
        -- 🔁 Transformer le jour pour que Lundi = 1, Dimanche = 7
        (CASE WHEN DAYOFWEEK(v.created_at) = 1 THEN 7 ELSE DAYOFWEEK(v.created_at) - 1 END) AS jours,
        COALESCE(SUM(v.quantite), 0) AS qte_vendu,
        COALESCE(SUM(v.total), 0) AS total_vendu
    FROM tb_vente_detail v
    WHERE YEARWEEK(v.created_at, 1) = YEARWEEK(CURDATE(), 1)
    GROUP BY (CASE WHEN DAYOFWEEK(v.created_at) = 1 THEN 7 ELSE DAYOFWEEK(v.created_at) - 1 END)
    ORDER BY jours ASC;
  `);

    // 🧹 Conversion BigInt → Number
    const cleanResult = result.map((r) => ({
      jours: Number(r.jours),
      qte_vendu: Number(r.qte_vendu),
      total_vendu: Number(r.total_vendu),
    }));

    // 🗓️ Jours de la semaine (en commençant par Lundi)
    const joursLabels = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dim",
    ];

    // 🧩 Reformater pour le frontend
    const data = joursLabels.map((label, index) => {
      const joursData = cleanResult.find((r) => r.jours === index + 1);

      return {
        jours: label,
        total_vendu: joursData ? joursData.total_vendu : 0,
        qte_vendu: joursData ? joursData.qte_vendu : 0,
      };
    });

    return data;
  }

  async getEvolutionVenteParMois() {
    const result = await this.prisma.$queryRawUnsafe<
      { mois: number; total_vendu: number; qte_vendu: number }[]
    >(`
    SELECT 
          mois,
          COALESCE(SUM(qte_vendu), 0) AS qte_vendu,
          COALESCE(SUM(total_vendu), 0) AS total_vendu
      FROM (
          SELECT 
              MONTH(v.created_at) AS mois,
              0 AS qte_vendu,
              SUM(v.total) AS total_vendu
          FROM tb_vente_detail v
          WHERE YEAR(v.created_at) = YEAR(CURDATE())
          GROUP BY MONTH(v.created_at)

          UNION ALL

          SELECT 
              MONTH(v.created_at) AS mois,
              SUM(v.quantite) AS qte_vendu,
              0 AS total_vendu
          FROM tb_vente_detail v
          WHERE YEAR(v.created_at) = YEAR(CURDATE())
          GROUP BY MONTH(v.created_at)
      ) AS total
      GROUP BY mois
      ORDER BY mois ASC;
  `);

    // 🧹 Conversion BigInt → Number
    const cleanResult = result.map((r) => ({
      mois: Number(r.mois),
      qte_vendu: Number(r.qte_vendu),
      total_vendu: Number(r.total_vendu),
    }));

    // 🗓️ Jours de la semaine (MySQL: 1=Dimanche, 7=Samedi)
    const moisLabels = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];

    // 🧩 Reformater pour le frontend
    const data = moisLabels.map((label, index) => {
      const moisData = cleanResult.find((r) => r.mois === index + 1);

      return {
        mois: label,
        total_vendu: moisData ? moisData.total_vendu : 0,
        qte_vendu: moisData ? moisData.qte_vendu : 0,
      };
    });

    return data;
  }



  async getEvolutionVenteParAnnee() {
    const result = await this.prisma.$queryRawUnsafe<
      { annee: number; total_vendu: number; qte_vendu: number }[]
    >(`
    SELECT 
          annee,
          COALESCE(SUM(qte_vendu), 0) AS qte_vendu,
          COALESCE(SUM(total_vendu), 0) AS total_vendu
      FROM (
          SELECT 
              YEAR(v.created_at) AS annee,
              0 AS qte_vendu,
              SUM(v.total) AS total_vendu
          FROM tb_vente_detail v
          GROUP BY YEAR(v.created_at)

          UNION ALL

          SELECT 
              YEAR(v.created_at) AS annee,
              SUM(v.quantite) AS qte_vendu,
              0 AS total_vendu
          FROM tb_vente_detail v
          GROUP BY YEAR(v.created_at)
      ) AS total
      GROUP BY annee
      ORDER BY annee ASC;
  `);

    // 🧹 Conversion BigInt → Number
    const data = result.map((r) => ({
      annee: Number(r.annee),
      qte_vendu: Number(r.qte_vendu),
      total_vendu: Number(r.total_vendu),
    }));

    // 🗓️ Jours de la semaine (MySQL: 1=Dimanche, 7=Samedi)
    // const anneeLabels = [
    //   "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    //   "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    // ];

    // 🧩 Reformater pour le frontend
    // const data = anneeLabels.map((label, index) => {
    //   const anneeData = cleanResult.find((r) => r.annee === index + 1);

    //   return {
    //     annee: label,
    //     total_vendu: anneeData ? anneeData.total_vendu : 0,
    //     qte_vendu: anneeData ? anneeData.qte_vendu : 0,
    //   };
    // });

    return data;
  }

  // ******************************* FIN DES FONCTIONS DU TABLEAU DE BORD COTE RESPONSABLE DE STOCK*******************************



  // ******************************* DEBUT DES FONCTIONS DU TABLEAU DE BORD COTE CAISSIER*******************************

  async FonctionDuPanTableauBordCaissier(userId: number) {
    // Début et fin de la journée (sans écraser today)
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 🔹 1. Montant total vendu du jour
    const venteJour = await this.prisma.tb_vente_detail.aggregate({
      where: {
        user_id: userId ?? 0,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: { total: true },
    });

    // 🔹 2. Nombre de ventes (tickets du jour)
    const totalVentes = await this.prisma.tb_vente.count({
      where: {
        user_id: userId ?? 0,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 🔹 3. Nombre total d’articles vendus du jour
    const articlesVenduesJour = await this.prisma.tb_vente_detail.aggregate({
      where: {
        user_id: userId ?? 0,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: { quantite: true },
    });

    // 🔹 4. Sécuriser les valeurs
    const montantVendu = venteJour._sum.total ?? 0;
    const totalTickets = totalVentes ?? 0;
    const totalArticles = articlesVenduesJour._sum.quantite ?? 0;

    // 🔹 5. Regrouper les résultats
    const result = {
      montantVendu,
      totalTickets,
      totalArticles,
    };

    // 🔹 6. Émettre la mise à jour via WebSocket (si nécessaire)
    this.produitGateway.envoyerMaj(result);

    return result;
  }




  async EvolutionVenteParJourParCaissier(userId: number) {
    const result = await this.prisma.$queryRawUnsafe<
      { jours: number; total_vendu: number; qte_vendu: number }[]
    >(`
    SELECT 
        -- 🔁 Transformer le jour pour que Lundi = 1, Dimanche = 7
        (CASE WHEN DAYOFWEEK(v.created_at) = 1 THEN 7 ELSE DAYOFWEEK(v.created_at) - 1 END) AS jours,
        COALESCE(SUM(v.quantite), 0) AS qte_vendu,
        COALESCE(SUM(v.total), 0) AS total_vendu
    FROM tb_vente_detail v
    WHERE YEARWEEK(v.created_at, 1) = YEARWEEK(CURDATE(), 1) and v.user_id = ${userId}
    GROUP BY (CASE WHEN DAYOFWEEK(v.created_at) = 1 THEN 7 ELSE DAYOFWEEK(v.created_at) - 1 END)
    ORDER BY jours ASC;
  `);

    // 🧹 Conversion BigInt → Number
    const cleanResult = result.map((r) => ({
      jours: Number(r.jours),
      qte_vendu: Number(r.qte_vendu),
      total_vendu: Number(r.total_vendu),
    }));

    // 🗓️ Jours de la semaine (en commençant par Lundi)
    const joursLabels = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dim",
    ];

    // 🧩 Reformater pour le frontend
    const data = joursLabels.map((label, index) => {
      const joursData = cleanResult.find((r) => r.jours === index + 1);

      return {
        jours: label,
        total_vendu: joursData ? joursData.total_vendu : 0,
        qte_vendu: joursData ? joursData.qte_vendu : 0,
      };
    });

    return data;
  }




  async EvolutionVenteParModePaiement(userId: number) {
    const result = await this.prisma.$queryRawUnsafe<
      { jour: number; mode_id: number; mode_libelle: string; total: number }[]
    >(`
    SELECT 
     (CASE WHEN DAYOFWEEK(v.created_at) = 1 THEN 7 ELSE DAYOFWEEK(v.created_at) - 1 END) AS jour,
      m.id AS mode_id,
      TRIM(LOWER(m.libelle)) AS mode_libelle,  -- 🔹 Nettoyage important
      COALESCE(SUM(v.montant_a_payer), 0) AS total
    FROM tb_vente v
    JOIN tb_mode_paiement m ON m.id = v.mode_paiement_id
    WHERE YEARWEEK(v.created_at, 1) = YEARWEEK(CURDATE(), 1)
      AND v.user_id = ${userId}
    GROUP BY jour, m.id, m.libelle
    ORDER BY jour ASC;
  `);
    // 🔹 Liste des jours
    const joursLabels = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];
    // 🔹 Extraire tous les modes de paiement trouvés
    const modes = [...new Set(result.map((r) => r.mode_libelle))];
    const data = joursLabels.map((label, index) => {
      const jourNum = index + 1;
      const jourData = result.filter((r) => Number(r.jour) === jourNum);
      const obj: any = { jour: label };
      modes.forEach((mode) => {
        const record = jourData.find((r) => r.mode_libelle === mode);
        obj[mode] = record ? Number(record.total) : 0;
      });

      return obj;
    });
    return data;
  }



  // ******************************* FIN DES FONCTIONS DU TABLEAU DE BORD COTE CAISSIER*******************************






}



