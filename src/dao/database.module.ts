import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseProviders } from './database.providers';
import { Author } from './entities/author.entity';
import { Model } from './entities/model.entity';
import { News } from './entities/news.entity';
import { Modelgroup } from './entities/modelgroup.entity';
import { ObjectGroup } from './entities/group.entity';
import { FGSObject } from './entities/object.entity';
import { PositionRequest } from './entities/request.entity';
import { Country } from './entities/country.entity';
import { UserAuthenticationMethod } from './entities/UserAuthenticationMethod.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.PGHOST,
            port: parseInt(process.env.PGPORT) || 5432,
            username: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            entities: [
                Author,
                Country,
                Model,
                Modelgroup,
                ObjectGroup,
                News,
                FGSObject,
                PositionRequest,
                UserAuthenticationMethod,
            ],
        }),
    ],
    providers: [...databaseProviders],
    exports: [],
})
export class DatabaseModule {}
