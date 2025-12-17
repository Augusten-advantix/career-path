import fs from 'fs';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import path from 'path';

export const parseFile = async (filePath: string, fileType: string): Promise<string> => {
    try {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (ext === '.txt') {
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            throw new Error(`Unsupported file type: ${ext}`);
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        throw error;
    }
};

export const extractBasicInfo = (text: string) => {
    // Very basic regex-based extraction for immediate preview
    // This will be improved by LLM later
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);

    // Naive name extraction (first non-empty line)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const name = lines[0] || 'Unknown';

    return {
        name: name.substring(0, 50), // Truncate if too long
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null,
        preview: text.substring(0, 200)
    };
};
