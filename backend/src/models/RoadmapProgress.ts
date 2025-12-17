import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ProgressItem {
    stepId: string;
    completed: boolean;
    completedAt: Date | null;
    deadline: Date;
    startDate: Date;
}

class RoadmapProgress extends Model {
    public id!: number;
    public userId!: number;
    public roadmapData!: any; // JSON data containing gaps and roadmap
    public progress!: ProgressItem[]; // Array of progress items
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

RoadmapProgress.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        roadmapData: {
            type: DataTypes.JSON,
            allowNull: false,
            comment: 'Full roadmap analysis including gaps and action plan',
        },
        progress: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array tracking completion status of each roadmap step',
        },
    },
    {
        sequelize,
        tableName: 'roadmap_progress',
        timestamps: true,
    }
);

// Set up association
RoadmapProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default RoadmapProgress;
