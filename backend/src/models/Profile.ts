import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Upload from './Upload';

class Profile extends Model {
    public id!: number;
    public uploadId!: number;
    public name!: string;
    public title!: string;
    public company!: string;
    public yearsExperience!: number;
    public skills!: any; // JSON
    public extractedSnippets!: any; // JSON
    public parseConfidence!: number;
    public analysis!: any; // JSON (stores the LLM result)
}

Profile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        uploadId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Upload,
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        yearsExperience: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        skills: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        extractedSnippets: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        parseConfidence: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        analysis: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'profiles',
    }
);

Profile.belongsTo(Upload, { foreignKey: 'uploadId' });
Upload.hasMany(Profile, { foreignKey: 'uploadId' });

export default Profile;
