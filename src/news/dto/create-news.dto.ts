import { IsNotEmpty } from 'class-validator';
import { Author } from 'src/dao/entities/author.entity';
import { ApiProperty } from '@nestjs/swagger';


export class CreateNewsDto {
    @ApiProperty()
    @IsNotEmpty()
    text: string;

    author: Author;
}
