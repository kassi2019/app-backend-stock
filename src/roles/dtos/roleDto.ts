import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class RoleDtoCreate {
    @IsOptional()
    @IsString()
    libelle?: string;
    code?: string;
}

export class RoleDtoUpdate {
    @IsOptional()
    @IsString()
    libelle?: string;
    code?: string;
    
}
