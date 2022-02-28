import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './shared/ExceptionFilter';
const mime = require('mime');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val; // named pipe
    }
    if (port > 0) {
        return port; // port number
    }
    return false;
}

function setupSwaggerDocumentation(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('FlightGear scenery API')
        .setDescription('API for FlightGear scenery database')
        .setExternalDoc('FlightGear', 'https://flightgear.org/')
        .setExternalDoc('FlightGear wiki', 'https://wiki.flightgear.org/')
        .setVersion('2.0')
        .addTag('scenery')
        .addTag('models')
        .addBearerAuth({ type: 'http', scheme: 'Bearer', bearerFormat: 'jwt',
            description: 'Use the token retrieved from the callback url after logging in through one of the supported authentication providers. Note your account has to be known in order to succesfully login.' })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}

function registerShutdownRoutines() {
    process.on('SIGTERM', () => {
        Logger.log('Received SIGTERM, shutting down');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        Logger.log('Received SIGINT, shutting down');
        process.exit(0);
    });

    if (process.env.node_env === 'debug') {
        Logger.log(`Running with environment ${process.env}`);
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe()).useGlobalFilters(new TypeOrmExceptionFilter());
    setupSwaggerDocumentation(app);
    registerShutdownRoutines();
    await app.listen(normalizePort(process.env.PORT || 3000));
}

mime.define({'application/octet-stream': ['ac']});
mime.define({'application/x-gtar")': ['tgz']});

bootstrap();
