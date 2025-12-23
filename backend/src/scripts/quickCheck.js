const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
});

async function quickCheck() {
    try {
        const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        const [profiles] = await sequelize.query('SELECT COUNT(*) as count FROM profiles');
        const [jobs] = await sequelize.query('SELECT COUNT(*) as count FROM analysis_jobs');

        console.log('===================');
        console.log('DATABASE QUICK CHECK');
        console.log('===================');
        console.log('Users:        ', users[0].count);
        console.log('Profiles:     ', profiles[0].count);
        console.log('Analysis Jobs:', jobs[0].count);
        console.log('===================');

        if (profiles[0].count > 0) {
            const [sampleProfiles] = await sequelize.query('SELECT id, name, title FROM profiles LIMIT 3');
            console.log('\nSample Profiles:');
            console.log(sampleProfiles);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

quickCheck();
