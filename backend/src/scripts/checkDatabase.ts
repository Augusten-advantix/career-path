import sequelize from '../config/database';
import User from '../models/User';
import Profile from '../models/Profile';
import AnalysisJob from '../models/AnalysisJob';
import Upload from '../models/Upload';

async function checkDatabaseContents() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Count records
        const userCount = await User.count();
        const profileCount = await Profile.count();
        const jobCount = await AnalysisJob.count();
        const uploadCount = await Upload.count();

        console.log('📊 DATABASE COUNTS:');
        console.log('==================');
        console.log('Users:         ', userCount);
        console.log('Profiles:      ', profileCount);
        console.log('Analysis Jobs: ', jobCount);
        console.log('Uploads:       ', uploadCount);
        console.log('');

        // Show sample profiles
        if (profileCount > 0) {
            console.log('📝 SAMPLE PROFILES:');
            console.log('==================');
            const profiles = await Profile.findAll({
                limit: 5,
                attributes: ['id', 'name', 'title', 'company', 'uploadId', 'createdAt']
            });
            profiles.forEach(p => {
                console.log(`ID: ${p.id}, Name: ${p.name}, Title: ${p.title}, Upload ID: ${p.uploadId}`);
            });
            console.log('');
        }

        // Show sample jobs
        if (jobCount > 0) {
            console.log('⚙️ SAMPLE ANALYSIS JOBS:');
            console.log('========================');
            const jobs = await AnalysisJob.findAll({
                limit: 5,
                attributes: ['id', 'profileId', 'status', 'createdAt']
            });
            jobs.forEach(j => {
                console.log(`ID: ${j.id}, Profile ID: ${j.profileId}, Status: ${j.status}`);
            });
            console.log('');
        }

        // Check table structure
        console.log('🗂️ TABLE STRUCTURES:');
        console.log('===================');
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Available tables:', tables.join(', '));
        console.log('');

        // Describe profiles table
        const profileDesc = await sequelize.getQueryInterface().describeTable('profiles');
        console.log('Profiles table columns:', Object.keys(profileDesc).join(', '));
        console.log('');

        // Describe analysis_jobs table
        const jobsDesc = await sequelize.getQueryInterface().describeTable('analysis_jobs');
        console.log('Analysis_jobs table columns:', Object.keys(jobsDesc).join(', '));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDatabaseContents();
