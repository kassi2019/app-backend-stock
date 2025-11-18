import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) { }

  async register(data: {
    matricule: string;
    password: string;
    nom_utilisateur: string;
    noms_prenoms: string;
    role_id: number | string; // 🔑 Peut venir en string si soumis depuis un formulaire


  }, userId?: number) {
    if (!data?.matricule || !data?.password || !data?.nom_utilisateur || !data?.noms_prenoms) {
      throw new Error('Champs manquants');
    }

    /* 1️⃣ Vérifier si le numéro existe déjà */
    const existing = await this.prisma.users.findUnique({
      where: { matricule: data.matricule },
    });
    if (existing) {
      throw new ConflictException('Ce numéro est déjà utilisé');
    }

    /* 2️⃣ Créer l’utilisateur */
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.users.create({
      data: {
        matricule: data.matricule,
        password: hashedPassword,
        nom_utilisateur: data.nom_utilisateur,
        noms_prenoms: data.noms_prenoms,
        role_id: typeof data.role_id === 'string' ? parseInt(data.role_id, 10) : data.role_id, // ✅ Conversion en Int

        user_id: userId ?? 0,
      },
    });

    return user;
  }



  async login(matricule: string, password: string) {
    const user = await this.prisma.users.findFirst({
      where: { matricule },
      include: { tb_roles: true }, // 🔑 Inclure le rôle
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('matricule ou mot de passe invalide');
    }

    const now = new Date();

    // Supprimer les sessions expirées avant vérification
    await this.prisma.user_sessions.updateMany({
      where: { userId: user.id, expires_at: { lt: now } },
      data: { expires_at: null }, // ✅ Marquer les expirées comme null
    });

    // Vérifier s'il existe une session active (non expirée et non null)
    // const activeSession = await this.prisma.user_sessions.findFirst({
    //   where: { userId: user.id, expires_at: { gt: now } },
    //   orderBy: { created_at: 'desc' },
    // });

    // if (activeSession) {
    //   throw new UnauthorizedException('Vous êtes déjà connecté sur un autre appareil.');
    // }

    // 🔥 Récupération du code du rôle (ADMIN, ASC, SUPERV...)
    const roleCode = user.tb_roles || ''; // Défaut : ASC

    // Générer le token JWT avec le rôle
    const payload = { sub: user.id, matricule: user.matricule, role: roleCode };
    const token = await this.jwt.signAsync(payload);

    // Définir l'expiration (24h)
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Créer une nouvelle session (sans supprimer les anciennes)
    await this.prisma.user_sessions.create({
      data: { userId: user.id, token, expires_at },
    });

    return {
      access_token: token,
      user: {
        id: Number(user.id),
        matricule: user.matricule,
        nom_utilisateur: user.nom_utilisateur,
        noms_prenoms: user.noms_prenoms,
        role: roleCode, // ✅ Retourner le rôle dans la réponse
      },
    };
  }


  async logout(token: string) {
    const session = await this.prisma.user_sessions.findFirst({ where: { token } });

    if (!session) {
      throw new UnauthorizedException('Session introuvable ou déjà déconnectée');
    }

    await this.prisma.user_sessions.update({
      where: { id: session.id },
      data: { expires_at: null }, // ✅ Mettre expiré à null
    });

    return { message: 'Déconnexion réussie' };
  }




  async getUserSessions(userId: number) {
    return this.prisma.user_sessions.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        token: true,
        created_at: true,
        expires_at: true,
        users: { // 🔥 Inclure les infos utilisateur
          select: {
            nom_utilisateur: true,
            noms_prenoms: true,
            matricule: true,
          },
        },
      },
    });
  }

}
