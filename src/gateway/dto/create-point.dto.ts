import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsLatitude,
  IsLongitude,
  IsIn,
} from 'class-validator';

const POINT_TYPES = [
  'Bar',
  'Sala de Conciertos',
  'Plaza',
  'Centro Cultural',
  'Estudio',
  'Discoteca',
  'Café con Música Viva',
  'Galería de Arte',
] as const;

export class CreatePointDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsLatitude()
  lat: number;

  @IsNumber()
  @IsLongitude()
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsString()
  @IsIn(POINT_TYPES)
  type: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  poster?: string;
}
