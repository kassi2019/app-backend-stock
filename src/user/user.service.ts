import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilisateurDtoUpdate } from './dtos/utilisateurDto';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }
    /**
   * 1️⃣ Mise à jour photo
   */
    async updateProfilePhoto(userId: number, fileName: string) {
        const photoUrl = `/uploads/profile-photos/${fileName}`;

        await this.prisma.users.update({
            where: { id: userId },
            data: { photoUrl: photoUrl },
        });

        return { message: 'Photo de profil mise à jour', photoUrl };
    }

    /**
   * 2️⃣ Mise à jour infos
   */
    async updateProfile(userId: number, data: any) {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                nom_utilisateur: data.nom_utilisateur,
                noms_prenoms: data.noms_prenoms,
                role_id: data.role_id,
                matricule: data.matricule,
            },
        });

        return { message: 'Profil mis à jour avec succès' };
    }

    /**
  * 3️⃣ Changer mot de passe
  */
    async changePassword(userId: number, oldPassword: string, newPassword: string) {
        const user = await this.prisma.users.findUnique({ where: { id: userId } });

        if (!user) throw new BadRequestException('Utilisateur introuvable');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new BadRequestException('Ancien mot de passe incorrect');

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Mot de passe modifié avec succès' };
    }

    // information de l'utilisateur connecté et son role

    async getConnectedUsers(userId: number) {

        const user = await this.prisma.users.findUnique({

            where: { id: userId },
            include: { tb_roles: true },
        });

        if (!user) {
            throw new BadRequestException('Utilisateur introuvable');
        }

        const roleCode = user.tb_roles || '';
        return {
            id: Number(user.id),
            matricule: user.matricule,
            nom_utilisateur: user.nom_utilisateur,
            noms_prenoms: user.noms_prenoms,
            photoUrl: user.photoUrl,
            role: roleCode, // ✅ Retourner le rôle dans la réponse
        }
    };

    async afficherleSupperviseurParRole(role_id: number) {

        const users = await this.prisma.users.findMany({
            where: { role_id: role_id },
        });
        return users;
    }
    async findAll() {
        const data = await this.prisma.users.findMany(
            {
                include: {
                    tb_roles: true, // jointure avec la table role
                },
                orderBy: {
                    nom_utilisateur: 'asc', // mieux que sort côté JS
                },
            }
        );
        return data.sort((a, b) => Number(a.nom_utilisateur) - Number(b.nom_utilisateur));
    }


    async delete(id: number) {
        return this.prisma.users.delete({
            where: { id: Number(id) },
        })
    }

    async update(id: number, data: UtilisateurDtoUpdate) {
        return this.prisma.users.update({
            where: { id: Number(id) },
            data,
        })
    }
}
