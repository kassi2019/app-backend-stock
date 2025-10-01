import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriefournisseurDto } from './create-categoriefournisseur.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoriefournisseurDto extends PartialType(CreateCategoriefournisseurDto) {
        @IsString()
        @IsOptional()
        libelle?: string;

}
