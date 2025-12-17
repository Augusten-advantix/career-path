import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Recruiter from './Recruiter';

class Batch extends Model {
    public id!: number;
    public recruiterId!: number;
    public status!: 'queued' | 'processing' | 'completed' | 'failed';
    public profilesCount!: number;
    public estimatedTokens!: number;
}

Batch.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        recruiterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Recruiter,
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('queued', 'processing', 'completed', 'failed'),
            defaultValue: 'queued',
        },
        profilesCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        estimatedTokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'batches',
    }
);

Batch.belongsTo(Recruiter, { foreignKey: 'recruiterId' });
Recruiter.hasMany(Batch, { foreignKey: 'recruiterId' });

export default Batch;
