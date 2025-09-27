import { IsArray, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class VenteDetailDto {
    @IsNumber()
    produit_id?: number;


    // @IsNumber()
    // vente_id?: number;
    @IsNumber()
    quantite?: number;

    @IsNumber()
    prix_unitaire?: number;

    @IsNumber()
    total?: number;
}

export class CreateVenteDto {
    @IsNumber()
    @Type(() => Number)
    montant_recu?: number | undefined;

    @IsNumber()
    @Type(() => Number)
    montant_a_payer?: number | undefined;

    @IsNumber()
    @Type(() => Number)
    monnaie_rendu?: number  | undefined;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VenteDetailDto)
    tb_vente_detail?: VenteDetailDto[];
}
