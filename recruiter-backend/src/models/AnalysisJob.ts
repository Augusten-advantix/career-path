import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Profile from './Profile';
import Batch from './Batch';

class AnalysisJob extends Model {
    public id!: number;
    public profileId!: number;
    public batchId!: number | null;
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
        batchId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Batch,
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

AnalysisJob.belongsTo(Batch, { foreignKey: 'batchId' });
Batch.hasMany(AnalysisJob, { foreignKey: 'batchId' });

export default AnalysisJob;
