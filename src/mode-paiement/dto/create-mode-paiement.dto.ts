import { IsOptional, IsString } from "class-validator";

export class CreateModePaiementDto {
    @IsString()
    @IsOptional()
    libelle?: string;
}
