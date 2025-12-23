import sequelize from '../config/database';
import { QueryInterface, DataTypes } from 'sequelize';

async function addAdminRole() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    try {
        console.log('🔄 Starting migration: Adding admin role fields to users table...');

        // Check if columns already exist
        const tableDescription = await queryInterface.describeTable('users');

        if (!tableDescription.isAdmin) {
            await queryInterface.addColumn('users', 'isAdmin', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            console.log('✅ Added isAdmin column');
        } else {
            console.log('ℹ️  isAdmin column already exists');
        }

        if (!tableDescription.role) {
            // Create ENUM type for role
            await queryInterface.addColumn('users', 'role', {
                type: DataTypes.ENUM('user', 'admin'),
                allowNull: false,
                defaultValue: 'user',
            });
            console.log('✅ Added role column');
        } else {
            console.log('ℹ️  role column already exists');
        }

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. Create an admin account using: npm run create-admin');
        console.log('   2. Restart your backend server');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run migration
addAdminRole();
