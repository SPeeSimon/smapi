import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorsModule } from './authors/authors.module';
import { Author } from './authors/entities/author.entity';
import { Model } from './models/entities/model.entity';
import { ModelsModule } from './models/models.module';
import { NewsModule } from './news/news.module';
import { ObjectsModule } from './objects/objects.module';
import { NavaidsModule } from './navaids/navaids.module';
import { SignsModule } from './signs/signs.module';
import { StatisticsModule } from './statistics/statistics.module';
import { News } from './news/entities/news.entity';
import { RedirectController } from './redirect/redirect.controller';
import { TsController } from './ts/ts.controller';
import { ModelgroupsModule } from './modelgroups/modelgroups.module';
import { Modelgroup } from './modelgroups/entities/modelgroup.entity';
import { ObjectGroup } from './modelgroups/entities/group.entity';
import { FGSObject } from './objects/entities/object.entity';
import { SubmissionsModule } from './submissions/submissions.module';
import { NavdbModule } from './navdb/navdb.module';
import { RssModule } from './rss/rss.module';
import { PositionRequest } from './submissions/entities/request.entity';
import { Country } from './navaids/entities/country.entity';
import { AuthModule } from './auth/auth.module';
import { UserAuthenticationMethod } from './auth/entities/UserAuthenticationMethod.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ModelsModule,
        AuthorsModule,
        // ConfigModule.load(path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.PGHOST,
            port: parseInt(process.env.PGPORT) || 5432,
            username: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            entities: [Author, Country, Model, Modelgroup, ObjectGroup, News, FGSObject, PositionRequest, UserAuthenticationMethod],
        }),
        NewsModule,
        ObjectsModule,
        NavaidsModule,
        SignsModule,
        StatisticsModule,
        ModelgroupsModule,
        SubmissionsModule,
        NavdbModule,
        RssModule,
        AuthModule,
    ],
    controllers: [AppController, RedirectController, TsController],
    providers: [AppService],
})
export class AppModule {

}
