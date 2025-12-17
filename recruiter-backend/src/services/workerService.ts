import AnalysisJob from '../models/AnalysisJob';
import Profile from '../models/Profile';
import { analyzeProfileBatch } from './llmService';

const BATCH_SIZE = 1; // Process one profile at a time as requested
const POLL_INTERVAL = 5000; // 5 seconds

export const startWorker = () => {
    console.log('👷 Analysis Worker started');
    setInterval(processQueue, POLL_INTERVAL);
};

const processQueue = async () => {
    try {
        // Import Upload model
        const Upload = require('../models/Upload').default;

        // Find queued jobs with Profile AND Upload included
        const jobs = await AnalysisJob.findAll({
            where: { status: 'queued' },
            limit: BATCH_SIZE,
            include: [{
                model: Profile,
                include: [Upload]  // Sequelize will use default association name
            }]
        });

        if (jobs.length === 0) return;

        console.log(`Processing ${jobs.length} jobs...`);

        // Optionally mark all jobs as 'running' here if desired. We'll set each job to running individually below.

        // Get recruiter ID from first job's profile's Upload (capital U)
        const firstProfile = (jobs[0] as any).Profile;
        const upload = firstProfile?.Upload;  // Capital U - default Sequelize association
        const recruiterId = upload?.recruiterId;

        // Skip job if no recruiter ID found
        if (!recruiterId) {
            console.error('❌ No recruiterId found in profile.Upload, skipping batch');
            await AnalysisJob.update(
                { status: 'failed', error: 'No recruiter ID found in upload' },
                { where: { id: jobs.map((j: any) => j.id) } }
            );
            return;
        }

        console.log('👤 Recruiter ID:', recruiterId);

        // Fetch latest completed job requirements for this recruiter as fallback
        const JobRequirements = require('../models/JobRequirements').default;
        const latestRequirements = await JobRequirements.findOne({
            where: { recruiterId, isComplete: true },
            order: [['createdAt', 'DESC']]
        });

        console.log('📋 Job requirements (fallback):', latestRequirements ? 'Found' : 'Not found - using general analysis');

        // Process jobs sequentially (one by one) with a 3 second gap between
        for (const job of jobs) {
            try {
                const profile = (job as any).Profile;
                // Mark this job as running individually (so UI updates per-profile)
                await job.update({ status: 'running' });

                const uploadJobReqId = upload?.jobRequirementId || null;
                // If upload has a jobRequirementId, fetch that requirement record specifically
                let specificReq: any = null;
                if (uploadJobReqId) {
                    specificReq = await JobRequirements.findOne({ where: { id: uploadJobReqId, recruiterId } });
                }

                const payload = [{
                    id: job.profileId,
                    name: profile.name,
                    title: profile.title,
                    resumeText: profile.extractedSnippets?.text || '',
                    parsedSkills: profile.skills || []
                }];

                console.log(`Sending job ${job.id} / profile ${job.profileId} to LLM...`);
                // Pass the specific requirement (if found), otherwise pass the latestRequirements (fallback)
                const requirementToUse = specificReq?.structuredRequirements || latestRequirements?.structuredRequirements;
                const results = await analyzeProfileBatch(payload, requirementToUse);
                const result = results && results[0];

                if (!result) {
                    console.error('No result for profile', job.profileId);
                    await job.update({ status: 'failed', error: 'No LLM result' });
                    continue;
                }

                // Update job and profile
                await job.update({ status: 'success', result });

                // If the LLM returned structured_profile, extract fields into Profile columns
                const structured = result.structured_profile || {};
                const updateObj: any = { analysis: result.analysis || result };
                if (structured.name) updateObj.name = structured.name;
                if (structured.title) updateObj.title = structured.title;
                if (structured.yearsExperience) updateObj.yearsExperience = Number(structured.yearsExperience) || null;
                if (structured.skills) updateObj.skills = structured.skills;
                // Add structured_profile to extractedSnippets for storing structured data inside profile record
                // We merge it into the existing extractedSnippets JSON if present
                const existingSnippets = profile.extractedSnippets || {};
                updateObj.extractedSnippets = {
                    ...existingSnippets,
                    structured: structured
                };

                await Profile.update(updateObj, { where: { id: job.profileId } });

                console.log(`Job ${job.id} processed, waiting 3s before next...`);
                // 3 second delay between profiles
                await new Promise(r => setTimeout(r, 3000));
            } catch (processErr: any) {
                console.error('Error processing single job:', job.id, processErr);
                await job.update({ status: 'failed', error: processErr.message });
            }
        }

    } catch (error: any) {
        console.error('Worker error:', error);
        // Helpful guidance when sqlite / sequelize schema mismatches occur
        const sqlMsg = error?.parent?.sql || error?.sql || '';
        if (sqlMsg && sqlMsg.includes('no such column')) {
            console.error('\n⚠️ The DB schema appears out of date (missing column).');
            console.error("Suggestions:\n 1) Restart the Recruiter backend to let `sequelize.sync({ alter: true })` apply schema changes.\n 2) If that doesn't work, run `npm run reset-db` in the 'recruiter-backend' directory to delete the local sqlite file and reinitialize the DB (development only).\n 3) In production, create a proper migration instead of relying on sync.\n");
        }
    }
};
