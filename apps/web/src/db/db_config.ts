import { Env } from '$env/svelte';

export interface DbConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}

const config: DbConfig = {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.DB_HOST || 'localhost',
    port: process.env.NODE_ENV === 'development' ? 5432 : parseInt(process.env.DB_PORT || '5432'),
    database: process.env.NODE_ENV === 'development' ? 'mydb' : process.env.DB_NAME || 'mydb',
    username: process.env.NODE_ENV === 'development' ? 'postgres' : process.env.DB_USER || 'postgres',
    password: process.env.NODE_ENV === 'development' ? 'postgres' : process.env.DB_PASSWORD || 'postgres',
};

export default config;