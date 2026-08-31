# AchieveCell — Step 3: Student Experience Foundation

AchieveCell is a student hackathon project for understanding a learner's current skills, finding suitable career paths, and showing exactly what to learn next. Step 3 adds a responsive student application on top of the Step 1 data foundation and Step 2 deterministic recommendation engine.

Students can register, sign in, select a target role, complete skill assessments, see their changed proficiency, and review the resulting career recommendations and skill gaps. No external Gemini, OpenAI, or other LLM API is configured. A local deterministic explanation service interprets the existing calculated results without changing their scores.

Step 4A polishes the student-facing experience: the authenticated dashboard, recommendations, target-role picker, assessments, and skill-gap analyzer share a responsive visual system and continue to use the existing Step 1–3 APIs.

## What this engine does

- Compares a student's recorded skills to every career's required skills.
- Calculates a transparent, weighted career-match score and ranks careers dynamically.
- Treats a required skill that is absent from `user_skills` as proficiency `0`; it is never ignored.
- Explains every score with a per-skill breakdown.
- Identifies Strong skills, skills that Need Improvement, Significant Gaps, and Missing skills.
- Assigns a simple, explainable learning priority to each gap.
- Calculates Profile Strength from the student's selected target role.
- Provides student registration, login, logout, protected current-user APIs, and hashed passwords.
- Stores seeded assessment questions and assessment attempts; a submitted result becomes the verified proficiency for that skill.
- Provides a responsive dashboard, Skills, Skill Gap Analyzer, Target Role, and Assessment pages.

## Project layout

```text
backend/src/
├── controllers/                  # Step 1–3 REST handlers
├── routes/api.routes.ts
├── services/
│   ├── career-recommendation.service.ts  # pure scoring and ranking functions
│   ├── career-analysis.service.ts        # database-backed analysis composition
│   ├── skill-gap.service.ts               # statuses, priorities, summaries
│   └── profile-strength.service.ts
│   ├── auth.service.ts                    # login and registration
│   ├── assessment.service.ts              # deterministic scoring and persistence
│   └── ai-recommendation.service.ts       # local explanation fallback
├── middleware/require-auth.ts
└── tests/                                 # Step 2 and Step 3 tests
frontend/src/App.tsx                       # responsive routed student app
```

## The scoring algorithm

For every required career skill:

```text
skill_match = MIN(student_proficiency / required_level, 1)
```

The career score is a weighted average, so high-importance skills have more influence:

```text
career_score = SUM(skill_match × importance) / SUM(importance)
match_score = ROUND(career_score × 100)
```

All returned final scores are whole numbers in the `0–100` range. A student at or above the required level receives a maximum `100%` match for that skill—extra proficiency cannot push a career score over 100.

For example, JavaScript at 60 against a required level of 80 is `60 / 80 = 75%`. If JavaScript has importance 90, it has more influence on the overall score than a 60-importance skill. This means the engine does **not** simply average raw student proficiencies.

If a career has no required skills, it ranks as `0` because a weighted score cannot be computed. A detailed selected-career analysis returns `422 CAREER_HAS_NO_SKILLS` instead of inventing a result.

## Skill gaps and priorities

For every career requirement:

```text
gap = MAX(required_level - student_proficiency, 0)
priority_score = ROUND(gap × importance / 100)
```

Status is relative to the role's required level:

| Condition | Status |
| --- | --- |
| Student level is `0` | Missing |
| Student level is at least the required level | Strong |
| Student level is at least 70% of the required level | Needs Improvement |
| Student level is above 0 but under 70% of the required level | Significant Gap |

Priorities are `High` at 50 or more, `Medium` at 25–49, and `Low` below 25. A missing Node.js skill with required level 70 and importance 90 has `70 × 90 / 100 = 63`, so it is High priority.

The analysis summary reports `strongSkills`, `missingSkills`, and `skillsToImprove`; the latter includes both **Needs Improvement** and **Significant Gap** statuses. It also returns `significantGaps` separately for the more urgent subset.

## API endpoints

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Step 1 health check. |
| GET | `/api/skills` | Step 1 skill catalog. |
| GET | `/api/careers` | Step 1 career catalog. |
| GET | `/api/careers/:id` | Step 1 career lookup. |
| GET | `/api/careers/:id/skills` | Step 1 career requirements. |
| GET | `/api/users/:id` | Step 1 user lookup. |
| GET | `/api/users/:id/skills` | Step 1 student skills. |
| GET | `/api/users/:id/career-recommendations?limit=5` | Top ranked careers; `limit` defaults to 5 (1–100). |
| GET | `/api/users/:userId/career-analysis/:careerId` | Complete score, breakdown, status groups, priorities, and summary. |
| GET | `/api/users/:userId/skill-gap/:careerId` | Focused skill-gap view of the selected-career analysis. |
| GET | `/api/users/:id/profile-strength` | Weighted score for the student's target role. |
| POST | `/api/auth/register` | Register a student and return an auth token. |
| POST | `/api/auth/login` | Log in a student and return an auth token. |
| GET | `/api/me` | Authenticated student profile. |
| GET | `/api/me/dashboard` | Dynamic dashboard data. |
| GET | `/api/me/skills` | Authenticated student's recorded skills. |
| PATCH | `/api/me/target-role` | Set target role with `{ "targetRoleId": 1 }`. |
| GET | `/api/me/career-analysis/:careerId` | Authenticated career skill-gap analysis. |
| GET | `/api/me/ai-recommendation` | Local explanation of deterministic target-role analysis. |
| GET | `/api/assessments` | Available deterministic assessments. |
| GET | `/api/assessments/skill/:skillId` | Safe assessment questions (no answers exposed). |
| POST | `/api/assessments/:assessmentId/submit` | Scores answers, records the attempt, and updates proficiency. |

### Example recommendations response

```json
{
  "user": { "id": 1, "name": "Ananya Sharma" },
  "recommendations": [
    { "careerId": 4, "career": "Software Engineer", "category": "Software Development", "matchScore": 69 }
  ]
}
```

Actual scores are calculated from the current database seed data and may change if skills or requirements change. Ties are resolved alphabetically by career name so rankings are reproducible.

### Example skill in a detailed analysis response

```json
{
  "skill": "React",
  "studentLevel": 30,
  "requiredLevel": 75,
  "importance": 85,
  "gap": 45,
  "matchPercentage": 40,
  "status": "Significant Gap",
  "priorityScore": 38,
  "priority": "Medium"
}
```

Invalid IDs return `400`, unknown users/careers return `404`, an empty user profile returns a valid zero-match analysis, and a user with no target role receives a graceful Profile Strength response with `profileStrength: null`.

## Run the project

### 1. Configure PostgreSQL

Create an empty database named `achievecell`, then create `backend/.env` from the example and set your own credentials:

```powershell
Copy-Item backend/.env.example backend/.env
```

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/achievecell?schema=public"
PORT=4000
```

### 2. Start the backend and seed demo data

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run dev
```

### 3. Run the automated tests

```powershell
cd backend
npm test
```

The tests cover Step 2 scoring and ranking plus password hashing, signed token validation, deterministic assessment scoring, and the local explanation provider.

### 4. Start the Step 3 student application

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The application opens at `/login`. Use the demo account below or register a new student:

```text
Email: ananya.sharma@achievecell.demo
Password: DemoPassword123!
```

Available student routes:

| Route | Purpose |
| --- | --- |
| `/login` | Sign in. |
| `/register` | Create a student account. |
| `/dashboard` | Profile strength, role, skills, gaps, recommendations, and guidance. |
| `/recommendations` | Career recommendations with direct links to each role’s skill-gap analysis. |
| `/skills` | Recorded skill proficiency and assessment shortcuts. |
| `/target-role` | Search, choose, and save a target career. |
| `/skill-gap` | Detailed Step 2 analysis for a selected role. |
| `/assessment` or `/assessments` | Select and complete a skill assessment. |
| `/settings` | Clear placeholder for later profile settings. |

Assessment results are calculated only from submitted answers on the server. The backend records an attempt and updates the matching `user_skills` record with the new score, so the dashboard, ranking, profile strength, and skill-gap results use the same Step 2 formula immediately on their next fetch.

The local explanation fallback never produces career scores. It receives the structured deterministic analysis and turns its strengths, gaps, and priorities into beginner-friendly next steps. It remains replaceable by a future provider.

### Test the APIs directly

```powershell
Invoke-RestMethod http://localhost:4000/api/users/1/career-recommendations?limit=5
Invoke-RestMethod http://localhost:4000/api/users/1/profile-strength
Invoke-RestMethod http://localhost:4000/api/users/1/career-analysis/1
Invoke-RestMethod http://localhost:4000/api/users/1/skill-gap/1
```

## Seed data

The idempotent seed supplies Ananya Sharma (B.Tech CSE, year 2), Full Stack Developer as her target role, 38 skills, 12 career roles, and 12 current skills. The requested examples are present: Python 90, JavaScript 60, SQL 75, React 30, and Git 85. Rerun `npm run prisma:seed` whenever you want to restore/update the supplied demo records without deleting unrelated data.

## Step 3 database additions

The Step 3 migration adds an optional `password_hash` field to `users`, plus `assessments`, `assessment_questions`, and `assessment_attempts`. The seed supplies three deterministic multiple-choice questions for JavaScript, React, Node.js, SQL, Python, HTML, CSS, and Git. Existing Step 1 and Step 2 tables, APIs, and career scoring remain unchanged.
