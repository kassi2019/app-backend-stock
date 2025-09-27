import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CategorieProduitDtoCreate {
    @IsOptional()
    @IsString()
    user_id?: number;
    @IsNotEmpty({ message: 'Le libellé est obligatoire' })
    libelle?: string;

}

export class CategorieProduitDtoUpdate {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Le libellé est obligatoire' })
    libelle?: string;
}
