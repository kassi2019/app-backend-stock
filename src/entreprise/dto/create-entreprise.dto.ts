import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateEntrepriseDto {
    @IsString()
    @IsOptional()
    nom_fournisseur?: string;
    @IsString()
    @IsOptional()
    telephone?: string;

    @IsOptional()
    // @IsInt()
    type_fournisseur_id?: number;
}
