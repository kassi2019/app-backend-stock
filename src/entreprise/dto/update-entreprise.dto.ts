import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrepriseDto } from './create-entreprise.dto';
import { IsInt, IsOptional, IsString } from "class-validator";
export class UpdateEntrepriseDto extends PartialType(CreateEntrepriseDto) {

    @IsString()
    @IsOptional()
    nom_fournisseur?: string;
    @IsString()
    @IsOptional()
    telephone?: string;

    @IsOptional()
    @IsInt()
    type_fournisseur_id?: number;
}
