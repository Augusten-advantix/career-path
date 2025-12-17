import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Upload extends Model {
    public id!: number;
    public recruiterId!: number;
    public filename!: string;
    public path!: string;
    public fileType!: string;
    public fileSize!: number;
    public status!: 'pending' | 'processed' | 'failed';
    public jobRequirementId?: number | null; // optional foreign key
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
        status: {
            type: DataTypes.ENUM('pending', 'processed', 'failed'),
            defaultValue: 'pending',
        },
        jobRequirementId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'uploads',
    }
);

export default Upload;
