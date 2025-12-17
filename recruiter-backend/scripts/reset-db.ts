import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'recruiter.sqlite');

if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('✅ recruiter.sqlite removed. Restart your server to recreate the DB schema.');
    } catch (err: any) {
        console.error('Error deleting recruiter.sqlite:', err.message || err);
        process.exit(1);
    }
} else {
    console.log('No recruiter.sqlite file found to remove.');
}

process.exit(0);
