import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Recruiter from './Recruiter';

class JobRequirements extends Model {
    public id!: number;
    public recruiterId!: number;
    public conversationHistory!: any; // JSON - stores Q&A pairs
    public structuredRequirements!: any; // JSON - extracted structured data
    public isComplete!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

JobRequirements.init(
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
        conversationHistory: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        structuredRequirements: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        isComplete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'job_requirements',
        timestamps: true,
    }
);

JobRequirements.belongsTo(Recruiter, { foreignKey: 'recruiterId' });
Recruiter.hasMany(JobRequirements, { foreignKey: 'recruiterId' });

export default JobRequirements;
