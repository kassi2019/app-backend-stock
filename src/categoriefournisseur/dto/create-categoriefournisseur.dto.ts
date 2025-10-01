import { IsOptional, IsString } from "class-validator";

export class CreateCategoriefournisseurDto {
    @IsString()
    @IsOptional()
    libelle?: string;
}
