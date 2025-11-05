import { PartialType } from '@nestjs/mapped-types';
import { CreateModePaiementDto } from './create-mode-paiement.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateModePaiementDto extends PartialType(CreateModePaiementDto) {
    @IsString()
    @IsOptional()
    libelle?: string;
}
