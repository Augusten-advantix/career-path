import fs from 'fs';
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import path from 'path';

export const parseDocument = async (filePath: string): Promise<string> => {
    console.log('📄 parseDocument called with path:', filePath);
    const ext = path.extname(filePath).toLowerCase();
    console.log('📎 File extension detected:', ext);

    try {
        if (ext === '.pdf') {
            console.log('📕 Parsing PDF file...');
            const dataBuffer = fs.readFileSync(filePath);
            console.log('📦 Buffer size:', dataBuffer.length, 'bytes');
            const data = await pdf(dataBuffer);
            console.log('✅ PDF parsed, text length:', data.text.length);
            return data.text;
        } else if (ext === '.docx' || ext === '.doc') {
            console.log('📘 Parsing DOCX/DOC file...');
            const result = await mammoth.extractRawText({ path: filePath });
            console.log('✅ DOCX/DOC parsed, text length:', result.value.length);
            return result.value;
        } else if (ext === '.txt') {
            console.log('📄 Reading TXT file...');
            const text = fs.readFileSync(filePath, 'utf-8');
            console.log('✅ TXT read, length:', text.length);
            return text;
        } else {
            console.error('❌ Unsupported file type:', ext);
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('❌ Error parsing document:', error);
        console.error('File path was:', filePath);
        throw new Error('Failed to parse document');
    }
};
