# Test Core Features - Manual Testing Guide

## Prerequisites
- Backend running on http://localhost:3000
- Valid authentication token
- Sample resume text

## Test 1: Classification Service

### Endpoint: POST /api/analysis/classify

```bash
# Replace {{TOKEN}} with your JWT token
# Replace {{RESUME_TEXT}} with actual resume text

curl -X POST http://localhost:3000/api/analysis/classify \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "{{RESUME_TEXT}}"
  }'
```

### Expected Output:
```json
{
  "classification": {
    "personalInfo": { ... },
    "skills": {
      "technical": [...],
      "soft": [...],
      "domain": [...]
    },
    "experience": [...],
    "education": [...],
    "certifications": [...],
    "experienceLevel": "mid|senior|entry|lead",
    "totalYearsExperience": number,
    "industryDomains": [...]
  },
  "summary": "Classification Summary: ..."
}
```

### Verification Checklist:
- [ ] Skills are categorized into technical/soft/domain
- [ ] Experience level is correctly identified
- [ ] Total years calculated from work history
- [ ] Personal info extracted (name, email, location)

---

## Test 2: Assessment Service

### Endpoint: POST /api/analysis/assess

```bash
curl -X POST http://localhost:3000/api/analysis/assess \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "classification": {{CLASSIFICATION_FROM_TEST_1}},
    "targetRole": "Senior Full Stack Developer",
    "answers": {
      "targetRole": "Senior Full Stack Developer",
      "timeline": "6 months"
    }
  }'
```

### Expected Output:
```json
{
  "classification": { ... },
  "targetRole": {
    "title": "Senior Full Stack Developer",
    "level": "Senior",
    "industry": "..."
  },
  "strengths": [
    {
      "description": "...",
      "evidence": [...],
      "impact": "high|medium|low"
    }
  ],
  "weaknesses": [...],
  "gaps": [...],
  "competitiveAnalysis": {
    "overallScore": 75,
    "comparedToPeers": "above_average",
    "marketReadiness": 80,
    "estimatedTimeToTarget": "3-6 months"
  },
  "roleRequirements": {
    "required": [...],
    "preferred": [...],
    "missing": [...],
    "satisfied": [...]
  }
}
```

### Verification Checklist:
- [ ] Strengths and weaknesses are separated
- [ ] Overall score is between 0-100
- [ ] Gaps include industry standards comparison
- [ ] Role requirements show matched vs missing

---

## Test 3: Recommendations Service

### Endpoint: POST /api/analysis/recommend

```bash
curl -X POST http://localhost:3000/api/analysis/recommend \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "assessment": {{ASSESSMENT_FROM_TEST_2}}
  }'
```

### Expected Output:
```json
{
  "roadmap": {
    "summary": {
      "totalSteps": 5,
      "estimatedDuration": "6-9 months",
      "estimatedCost": { "min": 100, "max": 500, "currency": "USD" }
    },
    "steps": [
      {
        "id": "step_1",
        "title": "...",
        "description": "...",
        "category": "learn|project|certification|networking",
        "priority": 1-5,
        "suggested_timeframe": "2 months",
        "deadline_days": 60,
        "resources": {
          "courses": [
            {
              "name": "Specific course name",
              "provider": "Coursera|Udemy|...",
              "url": "https://...",
              "duration": "40 hours",
              "cost": { "amount": 49, "currency": "USD" } or "free",
              "rating": 4.5,
              "difficulty": "intermediate"
            }
          ],
          "books": [...],
          "projects": [...],
          "communities": [...],
          "tools": [...]
        },
        "successCriteria": [...],
        "prerequisites": [...],
        "estimatedCost": { ... }
      }
    ]
  },
  "costSummary": "..."
}
```

### Verification Checklist:
- [ ] Courses have SPECIFIC names (not generic)
- [ ] Course providers are real (Coursera, Udemy, etc.)
- [ ] URLs are included for courses
- [ ] Books have authors and titles
- [ ] projects have concrete descriptions
- [ ] Communities are specific (Discord, Reddit, etc.)
- [ ] Cost estimates are provided
- [ ] Free alternatives are mentioned

---

## Test 4: Complete End-to-End Analysis

### Endpoint: POST /api/analysis/complete

```bash
curl -X POST http://localhost:3000/api/analysis/complete \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "{{RESUME_TEXT}}",
    "targetRole": "Senior Full Stack Developer",
    "answers": {
      "targetRole": "Senior Full Stack Developer"
    }
  }'
```

### Expected Output:
Combines all three: classification + assessment + roadmap

### Verification Checklist:
- [ ] All three sections present
- [ ] Flow works end-to-end
- [ ] Data is consistent across sections

---

## Frontend Testing

### Test the new components:

1. **ProfileSummary Component**
   - Shows experience level badge
   - Displays stats grid (skills, positions, degrees, certs)
   - Categorized skills with tags
   - Industry domains listed

2. **AssessmentDisplay Component**
   - Competitive score gauge (0-100)
   - Market readiness percentage
   - Strengths with green cards
   - Weaknesses with red cards
   - Role requirements checklist

3. **ResourceCard Component**
   - Course cards with provider, cost, duration
   - Clickable URLs that open in new tab
   - Book recommendations with Amazon links
   - Project ideas with complexity tags
   - Community links
   - Tool recommendations

---

## Success Criteria

After all tests pass, verify:

✅ Classification extracts structured data
✅ Assessment provides competitive scoring
✅ Recommendations include specific courses with URLs
✅ All course links are clickable
✅ Cost estimates are shown
✅ Free alternatives are mentioned
✅ Frontend components render properly
✅ Data flows correctly from backend to frontend

---

## Sample Resume for Testing

You can use this sample resume text for testing:

```
John Doe
Senior Software Engineer
john.doe@email.com | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

SUMMARY
Experienced software engineer with 6 years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of building scalable web applications and leading development teams.

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, Docker, AWS, Git
Soft: Team Leadership, Agile Development, Problem Solving, Communication

EXPERIENCE

Senior Software Engineer - Tech Corp (2021 - Present)
- Lead development of microservices architecture
- Mentor junior developers
- Implement CI/CD pipelines with AWS

Software Engineer - StartupXYZ (2019 - 2021)
- Built customer-facing web applications with React
- Developed RESTful APIs with Node.js
- Optimized database queries, reducing load time by 40%

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2015 - 2019)

CERTIFICATIONS
AWS Certified Developer - Associate (2022)
```

**Target Role for Testing**: "Senior Full Stack Developer" or "Staff Engineer"
