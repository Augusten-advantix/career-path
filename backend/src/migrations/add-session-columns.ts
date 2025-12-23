import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

/**
 * Migration: Add sessionStage and resumeText columns to profiles table
 * Run this script once to update the database schema
 */
async function migrate() {
    console.log('🔄 Starting migration: Adding session columns to profiles...');

    try {
        // Check if columns already exist
        const tableInfo: any[] = await sequelize.query(
            "PRAGMA table_info(profiles);",
            { type: QueryTypes.SELECT }
        );

        const columnNames = tableInfo.map((col: any) => col.name);

        // Add sessionStage column if it doesn't exist
        if (!columnNames.includes('sessionStage')) {
            console.log('📝 Adding sessionStage column...');
            await sequelize.query(
                "ALTER TABLE profiles ADD COLUMN sessionStage VARCHAR(255) DEFAULT 'review';"
            );
            console.log('✅ sessionStage column added');
        } else {
            console.log('✅ sessionStage column already exists');
        }

        // Add resumeText column if it doesn't exist
        if (!columnNames.includes('resumeText')) {
            console.log('📝 Adding resumeText column...');
            await sequelize.query(
                "ALTER TABLE profiles ADD COLUMN resumeText TEXT;"
            );
            console.log('✅ resumeText column added');
        } else {
            console.log('✅ resumeText column already exists');
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
