import { Request, Response } from 'express';
import Upload from '../models/Upload';
import Profile from '../models/Profile';
import AnalysisJob from '../models/AnalysisJob';
import { parseFile, extractBasicInfo } from '../services/parserService';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip'; // Need to install this

interface AuthRequest extends Request {
    user?: any;
}

export const uploadFiles = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const recruiterId = req.user.id;
        const results = [];

        for (const file of files) {
            // Handle ZIP files
            if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || file.originalname.endsWith('.zip')) {
                const zip = new AdmZip(file.path);
                const zipEntries = zip.getEntries();
                const extractPath = path.join(path.dirname(file.path), `extracted_${Date.now()}`);

                zip.extractAllTo(extractPath, true);

                // Process extracted files
                for (const entry of zipEntries) {
                    if (entry.isDirectory || entry.entryName.startsWith('__MACOSX')) continue;

                    const entryPath = path.join(extractPath, entry.entryName);
                    // Recursively process or just handle flat? Let's assume flat for now or handle simple nesting
                    // Check extension
                    const ext = path.extname(entry.entryName).toLowerCase();
                    if (!['.pdf', '.docx', '.txt'].includes(ext)) continue;

                    const jobRequirementId = req.body?.jobRequirementId ? Number(req.body.jobRequirementId) : null;
                    const uploadRecord = await Upload.create({
                        recruiterId,
                        filename: entry.entryName,
                        path: entryPath,
                        fileType: ext,
                        fileSize: entry.header.size,
                        jobRequirementId,
                        status: 'processed'
                    });

                    try {
                        const text = await parseFile(entryPath, ext);
                        const basicInfo = extractBasicInfo(text);

                        const profile = await Profile.create({
                            uploadId: uploadRecord.id,
                            name: basicInfo.name,
                            parseConfidence: 0.7, // Placeholder
                            extractedSnippets: { text: text.substring(0, 1000) } // Store first 1000 chars as snippet
                        });

                        // Enqueue an analysis job for this profile
                        await AnalysisJob.create({ profileId: profile.id, status: 'queued' });

                        results.push({
                            uploadId: uploadRecord.id,
                            profileId: profile.id,
                            filename: entry.entryName
                        });
                    } catch (err) {
                        console.error(`Failed to parse ${entry.entryName}:`, err);
                        await uploadRecord.update({ status: 'failed' });
                    }
                }

                // Cleanup zip file? Maybe keep it for record
            } else {
                // Single file
                const jobRequirementId = req.body?.jobRequirementId ? Number(req.body.jobRequirementId) : null;
                const uploadRecord = await Upload.create({
                    recruiterId,
                    filename: file.originalname,
                    path: file.path,
                    fileType: path.extname(file.originalname).toLowerCase(),
                    fileSize: file.size,
                    jobRequirementId,
                    status: 'processed'
                });

                    try {
                    const text = await parseFile(file.path, uploadRecord.fileType);
                    const basicInfo = extractBasicInfo(text);

                    const profile = await Profile.create({
                        uploadId: uploadRecord.id,
                        name: basicInfo.name,
                        parseConfidence: 0.7,
                        extractedSnippets: { text: text.substring(0, 1000) }
                    });

                    // Enqueue analysis job
                    await AnalysisJob.create({ profileId: profile.id, status: 'queued' });

                    results.push({
                        uploadId: uploadRecord.id,
                        profileId: profile.id,
                        filename: file.originalname
                    });
                } catch (err) {
                    console.error(`Failed to parse ${file.originalname}:`, err);
                    await uploadRecord.update({ status: 'failed' });
                }
            }
        }

        res.json({ uploads: results });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProfiles = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch profiles via Uploads -> Recruiter
        // This is a bit complex with Sequelize associations if not direct
        // But we defined Recruiter -> Upload -> Profile

        // Easier: Find Uploads by recruiterId, then Profiles by uploadId
        const jobRequirementId = req.query.jobRequirementId ? Number(req.query.jobRequirementId) : null;
        const uploadsWhere: any = { recruiterId: req.user.id };
        if (jobRequirementId) uploadsWhere.jobRequirementId = jobRequirementId;

        const uploads = await Upload.findAll({
            where: uploadsWhere,
            include: [{ model: Profile, include: [AnalysisJob] }]
        });

        const profiles = uploads.flatMap(u => (u as any).Profiles || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            title: p.title,
            parseConfidence: p.parseConfidence,
            analysis: p.analysis,
            analysisJob: p.AnalysisJob || null
        }));

        res.json(profiles);
    } catch (error) {
        console.error('Get profiles error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteProfiles = async (req: AuthRequest, res: Response) => {
    try {
        const { profileIds } = req.body;
        if (!profileIds || !Array.isArray(profileIds)) {
            return res.status(400).json({ error: 'Invalid profileIds' });
        }

        // Remove associated AnalysisJobs first
        await AnalysisJob.destroy({ where: { profileId: profileIds } });

        // Remove profiles
        await Profile.destroy({ where: { id: profileIds } });

        res.json({ message: `Deleted ${profileIds.length} profiles` });
    } catch (error) {
        console.error('Delete profiles error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
