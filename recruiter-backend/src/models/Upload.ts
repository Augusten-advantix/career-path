import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Recruiter from './Recruiter';
import JobRequirements from './JobRequirements';

class Upload extends Model {
    public id!: number;
    public recruiterId!: number;
    public filename!: string;
    public path!: string;
    public fileType!: string;
    public fileSize!: number;
    public status!: 'pending' | 'processed' | 'failed';
    public jobRequirementId?: number | null;
}

Upload.init(
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
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jobRequirementId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: JobRequirements,
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('pending', 'processed', 'failed'),
            defaultValue: 'pending',
        },
    },
    {
        sequelize,
        tableName: 'uploads',
    }
);

Upload.belongsTo(Recruiter, { foreignKey: 'recruiterId' });
Recruiter.hasMany(Upload, { foreignKey: 'recruiterId' });

Upload.belongsTo(JobRequirements, { foreignKey: 'jobRequirementId' });
JobRequirements.hasMany(Upload, { foreignKey: 'jobRequirementId' });

export default Upload;
