export const config = {
    port: process.env.PORT || 3000,
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
    env: process.env.NODE_ENV || 'development',
};
