import sequelize from '../src/config/database';
import { DataTypes } from 'sequelize';

const run = async () => {
    try {
        const qi = sequelize.getQueryInterface();
        console.log('Checking `uploads` table schema...');
        const columns = await qi.describeTable('uploads');
        if (!('jobRequirementId' in columns)) {
            console.log("Column 'jobRequirementId' missing — adding now...");
            await qi.addColumn('uploads', 'jobRequirementId', {
                type: DataTypes.INTEGER,
                allowNull: true,
            });
            console.log("✅ 'jobRequirementId' column added to 'uploads'.");
        } else {
            console.log("'jobRequirementId' column already exists on 'uploads', nothing to do.");
        }
    } catch (err: any) {
        console.error('Error while ensuring schema:', err?.message || err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

run();
