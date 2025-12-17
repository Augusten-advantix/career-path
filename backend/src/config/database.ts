import { Sequelize } from 'sequelize';
import path from 'path';

// Use PostgreSQL in production (DATABASE_URL), SQLite for local dev
const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl) {
    // Production: PostgreSQL
    console.log('📦 Using PostgreSQL database');
    sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Required for Render's PostgreSQL
            },
        },
        logging: false,
    });
} else {
    // Development: SQLite
    console.log('📦 Using SQLite database (development)');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'),
        logging: false,
    });
}

export default sequelize;
