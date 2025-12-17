import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Profile from './Profile';

class AnalysisJob extends Model {
    public id!: number;
    public profileId!: number;
    public status!: 'queued' | 'running' | 'success' | 'failed';
    public result!: any; // JSON
    public error!: string | null;
}

AnalysisJob.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        profileId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Profile,
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('queued', 'running', 'success', 'failed'),
            defaultValue: 'queued',
        },
        result: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        error: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'analysis_jobs',
    }
);

AnalysisJob.belongsTo(Profile, { foreignKey: 'profileId' });
Profile.hasOne(AnalysisJob, { foreignKey: 'profileId' });

export default AnalysisJob;
