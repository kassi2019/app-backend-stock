import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class TypeMouvementDtoCreate {
    @IsOptional()
    @IsString()
    user_id?: number;
    @IsNotEmpty({ message: 'Le libellé est obligatoire' })
    libelle?: string;

}

export class TypeMouvementDtoUpdate {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Le libellé est obligatoire' })
    libelle?: string;
}
