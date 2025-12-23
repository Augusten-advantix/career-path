import User from '../models/User';
import sequelize from '../config/database';

interface CreateAdminOptions {
    email: string;
    password?: string;
    name?: string;
    promote?: boolean;
}

function parseArguments(): CreateAdminOptions {
    const args = process.argv.slice(2);
    const options: CreateAdminOptions = { email: '' };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--email':
                options.email = args[++i];
                break;
            case '--password':
                options.password = args[++i];
                break;
            case '--name':
                options.name = args[++i];
                break;
            case '--promote':
                options.promote = true;
                break;
        }
    }

    return options;
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

async function createAdmin() {
    const options = parseArguments();

    // Validate required fields
    if (!options.email) {
        console.error('❌ Error: Email is required');
        console.log('Usage:');
        console.log('  Create new admin: npm run create-admin -- --email admin@example.com --password SecurePass123! --name "Admin User"');
        console.log('  Promote existing: npm run create-admin -- --email user@example.com --promote');
        process.exit(1);
    }

    if (!validateEmail(options.email)) {
        console.error('❌ Error: Invalid email format');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        if (options.promote) {
            // Promote existing user to admin
            const user = await User.findOne({ where: { email: options.email } });

            if (!user) {
                console.error(`❌ Error: User with email ${options.email} not found`);
                process.exit(1);
            }

            if (user.isAdmin) {
                console.log(`ℹ️  User ${options.email} is already an admin`);
                process.exit(0);
            }

            await user.update({ isAdmin: true, role: 'admin' });
            console.log(`✅ Successfully promoted ${options.email} to admin`);
        } else {
            // Create new admin user
            if (!options.password) {
                console.error('❌ Error: Password is required for creating new admin');
                console.log('Usage: npm run create-admin -- --email admin@example.com --password SecurePass123! --name "Admin User"');
                process.exit(1);
            }

            if (!validatePassword(options.password)) {
                console.error('❌ Error: Password must be at least 8 characters with uppercase, lowercase, number, and special character');
                process.exit(1);
            }

            // Check if user already exists
            const existingUser = await User.findOne({ where: { email: options.email } });
            if (existingUser) {
                console.error(`❌ Error: User with email ${options.email} already exists`);
                console.log('💡 Tip: Use --promote flag to promote existing user to admin');
                process.exit(1);
            }

            // Create new admin user
            const adminUser = await User.create({
                email: options.email,
                password: options.password,
                name: options.name || 'Admin User',
                isAdmin: true,
                role: 'admin',
            });

            console.log('✅ Successfully created admin account');
            console.log('📧 Email:', adminUser.email);
            console.log('👤 Name:', adminUser.name);
            console.log('');
            console.log('🎉 You can now log in with this account and access the admin panel at /admin');
        }
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the script
createAdmin();
