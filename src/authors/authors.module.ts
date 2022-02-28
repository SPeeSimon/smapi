import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { Connection } from 'typeorm';
import { Author } from './entities/author.entity';
import { DatabaseModule } from 'src/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const authorProvider = [
  {
    provide: 'AUTHOR_REPO',
    useFactory: (connection: Connection) => connection.getRepository(Author),
    inject: ['DATABASE_CONNECTION'],
  },
];

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
