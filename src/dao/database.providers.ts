import { createConnection } from 'typeorm';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async () =>
            await createConnection({
                type: 'postgres',
                host: process.env.PGHOST,
                port: parseInt(process.env.PGPORT) || 5432,
                username: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                database: process.env.PGDATABASE,
                entities: [],
            }),
    },
];
