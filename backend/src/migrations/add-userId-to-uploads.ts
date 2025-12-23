import sequelize from '../config/database';
import { QueryInterface, DataTypes } from 'sequelize';

async function addUserIdToUploads() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Starting migration: Adding userId to uploads table...');

        // Check if column already exists
        const tableDescription = await queryInterface.describeTable('uploads');

        if (!tableDescription.userId) {
            await queryInterface.addColumn('uploads', 'userId', {
                type: DataTypes.INTEGER,
                allowNull: true, // Nullable to preserve existing data
            });
            console.log('✅ Added userId column to uploads table');
        } else {
            console.log('ℹ️  userId column already exists');
        }

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('📝 Note: Existing uploads will have userId = NULL');
        console.log('📝 New uploads will automatically save the user ID');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run migration
addUserIdToUploads();
