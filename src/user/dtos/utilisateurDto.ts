import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class UtilisateurDtoUpdate {
    @IsOptional()
    @IsString()
    noms_prenoms?: string;
    nom_utilisateur?: string;
    matricule?: string;
    role_id?: number;

}
