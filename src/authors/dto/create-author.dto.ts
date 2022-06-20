import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateAuthorDto {
    @IsNotEmpty()
    @MaxLength(40)
    @Matches(/^[^|]+$/u)
    name: string;
    @IsEmail()
    @MaxLength(50)
    email: string;
    
    description?: string;
}
