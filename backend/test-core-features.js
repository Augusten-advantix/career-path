const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzY0MDQ4NDQ3LCJleHAiOjE3NjQxMzQ4NDd9.qwqI3DNqioupiSKoki4q2DMAj0A8ZyNX3VoDzN1PmFA';
const baseURL = 'http://localhost:3000/api';

const resumeText = `Augusten Rabi MP
UI developer, Python Programmer
Personal Information
#1, 14th street, vinayaga nagar,
chen nai 600070
+91 6383172744
augustenrabi2020@gmail.com
Technical skills
Web technologies
Tailwind css
django
Soft skills
Public speaking
Negosiation skills
Problem Solving
Organizational Skills
Languages
English
Professional
Tamil
Native
Hobbies
1. Solving puzzle games like rubik's
cube, sudoku, Tower of Hanoi,
etc..
2. Developing different models of
UI designs like button, search
bar, navigation bar, etc..
Career Objective
To be a class front-end developer leveraging
expertise in HTML, CSS, JavaScript to create a
engaging and user-friendly web applications.
Committed to continuous learning and drive
business success.
Education
Bachelor of Computer Application(BCA)
Vels University (2022 - present) University
board
XII - Commerce with computer application
Jaigopal Garodia National School(2021 -
2022) State board
Work Experience
Wish Master - Flipkart Ekart
Feb 2024 - Aug 2024
1.  Deliver the orders to customer within
timelimit
2. Understanding the customer situation and
give them the solution on their orders
Certifications
Certified as a CSS master from Infosys
Springboard (AUG 22,2024)`;

async function testCompleteAnalysis() {
    try {
        console.log('🚀 Testing Complete Analysis Endpoint...\n');
        console.log('⏰ This will take 2-3 minutes (making 3 AI calls)...\n');
        console.log('Target Role: Senior Frontend Developer\n');

        const response = await axios.post(`${baseURL}/analysis/complete`, {
            resumeText,
            targetRole: 'Senior Frontend Developer',
            answers: {
                experienceYears: '1',
                targetTimeline: '6-12 months'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 180000 // 3 minutes timeout for AI processing
        });

        const { classification, assessment, roadmap } = response.data;

        console.log('='.repeat(80));
        console.log('📋 CLASSIFICATION RESULTS');
        console.log('='.repeat(80));
        console.log(`\nName: ${classification.personalInfo.name || 'N/A'}`);
        console.log(`Email: ${classification.personalInfo.email || 'N/A'}`);
        console.log(`Location: ${classification.personalInfo.location || 'N/A'}`);
        console.log(`\nExperience Level: ${classification.experienceLevel.toUpperCase()}`);
        console.log(`Total Years: ${classification.totalYearsExperience}`);
        console.log(`\nTechnical Skills (${classification.skills.technical.length}):`);
        classification.skills.technical.slice(0, 10).forEach(skill => {
            console.log(`  - ${skill.name} ${skill.yearsOfExperience ? `(${skill.yearsOfExperience}y)` : ''}`);
        });
        console.log(`\nSoft Skills (${classification.skills.soft.length}):`);
        classification.skills.soft.forEach(skill => {
            console.log(`  - ${skill.name}`);
        });
        console.log(`\nIndustries: ${classification.industryDomains.join(', ') || 'N/A'}`);

        console.log('\n' + '='.repeat(80));
        console.log('📊 ASSESSMENT RESULTS');
        console.log('='.repeat(80));
        console.log(`\nCompetitive Score: ${assessment.competitiveAnalysis.overallScore}/100`);
        console.log(`Compared to Peers: ${assessment.competitiveAnalysis.comparedToPeers.replace(/_/g, ' ').toUpperCase()}`);
        console.log(`Market Readiness: ${assessment.competitiveAnalysis.marketReadiness}%`);
        console.log(`Time to Target: ${assessment.competitiveAnalysis.estimatedTimeToTarget}`);

        console.log(`\n✅ Strengths (${assessment.strengths.length}):`);
        assessment.strengths.slice(0, 3).forEach((strength, idx) => {
            console.log(`  ${idx + 1}. ${strength.description} (${strength.impact.toUpperCase()} IMPACT)`);
        });

        console.log(`\n⚠️  Weaknesses (${assessment.weaknesses.length}):`);
        assessment.weaknesses.slice(0, 3).forEach((weakness, idx) => {
            console.log(`  ${idx + 1}. ${weakness.description} (${weakness.severity.toUpperCase()})`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('🗺️  ROADMAP RECOMMENDATIONS');
        console.log('='.repeat(80));
        console.log(`\nTotal Steps: ${roadmap.summary.totalSteps}`);
        console.log(`Duration: ${roadmap.summary.estimatedDuration}`);
        console.log(`Cost: $${roadmap.summary.estimatedCost.min} - $${roadmap.summary.estimatedCost.max}`);

        console.log(`\nTop 3 Steps:\n`);
        roadmap.steps.slice(0, 3).forEach((step, idx) => {
            console.log(`${idx + 1}. ${step.title} (Priority: ${step.priority})`);
            console.log(`   Category: ${step.category} | Timeframe: ${step.suggested_timeframe}`);
            console.log(`   Cost: $${step.estimatedCost.min}-$${step.estimatedCost.max}`);

            if (step.resources.courses && step.resources.courses.length > 0) {
                console.log(`   📚 Courses:`);
                step.resources.courses.slice(0, 2).forEach(course => {
                    const cost = course.cost === 'free' ? 'Free' : `$${course.cost.amount}`;
                    console.log(`      - ${course.name} (${course.provider}) - ${cost}`);
                    console.log(`        URL: ${course.url}`);
                });
            }

            if (step.resources.books && step.resources.books.length > 0) {
                console.log(`   📖 Books:`);
                step.resources.books.slice(0, 1).forEach(book => {
                    console.log(`      - "${book.title}" by ${book.author}`);
                });
            }

            if (step.resources.projects && step.resources.projects.length > 0) {
                console.log(`   💻 projects:`);
                step.resources.projects.slice(0, 1).forEach(project => {
                    console.log(`      - ${project.title} (${project.complexity}, ~${project.estimatedHours}h)`);
                });
            }

            console.log('');
        });

        console.log('='.repeat(80));
        console.log('✅ TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error testing complete analysis:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received. Is the backend running?');
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
console.log('Starting core features test...\n');
testCompleteAnalysis();
