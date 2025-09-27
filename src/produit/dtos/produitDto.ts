import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, IsDateString } from 'class-validator';
export class ProduitDtoCreate {
  @IsString()
  @IsOptional()
  libelle?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  code_barre?: string;

  @IsString()
  @IsOptional()
  unitaire?: string;

  @IsNumber()
  @IsOptional()
  prix_unitaire?: number;
}

export class ProduitDtoUpdate {
  @IsString()
  @IsOptional()
  libelle?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  code_barre?: string;

  @IsString()
  @IsOptional()
  unitaire?: string;

  @IsNumber()
  @IsOptional()
  prix_unitaire?: number;
}


export class ProduitLotDtoCreate {
  @IsInt()
  @IsOptional()
  produit_id?: number;

  @IsString()
  @IsOptional()
  code_lot?: string;


  @IsString()
  expiration_date?: string | null;

  @IsInt()
  @IsOptional()
  quantite?: number;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "prix_achat doit être un nombre" })

  prix_achat?: number;



}


