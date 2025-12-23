import sequelize from '../config/database';
import { QueryInterface, DataTypes } from 'sequelize';

async function addUserIdToProfiles() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Starting migration: Adding userId to profiles table...');

        // Check if column already exists
        const tableDescription = await queryInterface.describeTable('profiles');

        if (!tableDescription.userId) {
            await queryInterface.addColumn('profiles', 'userId', {
                type: DataTypes.INTEGER,
                allowNull: true,
            });
            console.log('✅ Added userId column to profiles table');
        } else {
            console.log('ℹ️  userId column already exists');
        }

        // Make uploadId nullable
        if (tableDescription.uploadId) {
            await queryInterface.changeColumn('profiles', 'uploadId', {
                type: DataTypes.INTEGER,
                allowNull: true,
            });
            console.log('✅ Made uploadId nullable');
        }

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run migration
addUserIdToProfiles();
