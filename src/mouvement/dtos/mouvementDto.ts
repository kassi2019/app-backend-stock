import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class MouvementDtoCreate {
    @IsOptional()
    @IsString()
    user_id?: number;
    @IsNotEmpty({ message: 'Le libellé est obligatoire' })
    libelle?: string;
    @IsNotEmpty({ message: 'Le type de mouvement est obligatoire' })
    type_mouvement_id?: number;

}

export class MouvementDtoUpdate {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Le libellé est obligatoire' })
    libelle?: string;
    @IsNotEmpty({ message: 'Le type de mouvement est obligatoire' })
    type_mouvement_id?: number;
}
