import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from "@nestjs/serve-static";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorsModule } from './authors/authors.module';
import { ModelsModule } from './models/models.module';
import { NewsModule } from './news/news.module';
import { ObjectsModule } from './objects/objects.module';
import { NavaidsModule } from './navaids/navaids.module';
import { SignsModule } from './signs/signs.module';
import { StatisticsModule } from './statistics/statistics.module';
import { RedirectController } from './redirect/redirect.controller';
import { TsController } from './ts/ts.controller';
import { ModelgroupsModule } from './modelgroups/modelgroups.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { NavdbModule } from './navdb/navdb.module';
import { RssModule } from './rss/rss.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './dao/database.module';
import { TsService } from './ts/ts.service';
import { SendMailOnEventService } from './notifications/send-mail-on-event.service';
import { join } from 'path';

@Module({
    imports: [
        AuthModule,
        AuthorsModule,
        ConfigModule.forRoot({ isGlobal: true }), // ConfigModule.load(path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}')),
        DatabaseModule,
        EventEmitterModule.forRoot(),
        ModelgroupsModule,
        ModelsModule,
        NavaidsModule,
        NavdbModule,
        NewsModule,
        ObjectsModule,
        RssModule,
        SignsModule,
        StatisticsModule,
        SubmissionsModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, 'public'),
            serveStaticOptions: {
                index: false,
                maxAge: 31536000 * 1000 // cache 1 year
            }
        }),
    ],
    controllers: [AppController, RedirectController, TsController],
    providers: [AppService, TsService, SendMailOnEventService],
})
export class AppModule {

}
