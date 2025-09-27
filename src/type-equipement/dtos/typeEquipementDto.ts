import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class TypeEquipementDtoCreate {
  @IsOptional()
  @IsString()
  libelle?: string;
  user_id?: number; // facultatif si récupéré via token
  heure_creation?: string;
}

export class TypeEquipementDtoUpdate {
  @IsOptional()
  @IsString()
  libelle?: string;
}
