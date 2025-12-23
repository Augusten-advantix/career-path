import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

/**
 * Migration: Add conversationHistory column to profiles table
 * Run this script once to update the database schema
 */
async function migrate() {
    console.log('🔄 Starting migration: Adding conversationHistory to profiles...');

    try {
        // Check if column already exists
        const tableInfo: any[] = await sequelize.query(
            "PRAGMA table_info(profiles);",
            { type: QueryTypes.SELECT }
        );

        const columnNames = tableInfo.map((col: any) => col.name);

        if (!columnNames.includes('conversationHistory')) {
            console.log('📝 Adding conversationHistory column...');
            await sequelize.query(
                "ALTER TABLE profiles ADD COLUMN conversationHistory TEXT;"
            );
            console.log('✅ conversationHistory column added');
        } else {
            console.log('✅ conversationHistory column already exists');
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
