import { Router } from 'express';
import { getCareerById, getCareers, getCareerSkills } from '../controllers/careers.controller.js';
import { getHealth } from '../controllers/health.controller.js';
import { getSkills } from '../controllers/skills.controller.js';
import { getUserById, getUserSkills } from '../controllers/users.controller.js';
import { getCareerAnalysis, getRecommendations, getSkillGap, getUserProfileStrength } from '../controllers/recommendations.controller.js';
import { getMe, login, register } from '../controllers/auth.controller.js';
import { getAssessment, getAssessments, submitMyAssessment } from '../controllers/assessments.controller.js';
import { getAiRecommendation, getMyCareerAnalysis, getMyDashboard, getMySkills, setMyTargetRole } from '../controllers/student.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);
apiRouter.get('/skills', getSkills);
apiRouter.get('/careers', getCareers);
apiRouter.get('/careers/:id', getCareerById);
apiRouter.get('/careers/:id/skills', getCareerSkills);
apiRouter.get('/users/:id', getUserById);
apiRouter.get('/users/:id/skills', getUserSkills);
apiRouter.get('/users/:id/career-recommendations', getRecommendations);
apiRouter.get('/users/:id/profile-strength', getUserProfileStrength);
apiRouter.get('/users/:userId/career-analysis/:careerId', getCareerAnalysis);
apiRouter.get('/users/:userId/skill-gap/:careerId', getSkillGap);

apiRouter.get('/me', requireAuth, getMe);
apiRouter.get('/me/dashboard', requireAuth, getMyDashboard);
apiRouter.get('/me/skills', requireAuth, getMySkills);
apiRouter.patch('/me/target-role', requireAuth, setMyTargetRole);
apiRouter.get('/me/career-analysis/:careerId', requireAuth, getMyCareerAnalysis);
apiRouter.get('/me/ai-recommendation', requireAuth, getAiRecommendation);
apiRouter.get('/assessments', requireAuth, getAssessments);
apiRouter.get('/assessments/skill/:skillId', requireAuth, getAssessment);
apiRouter.post('/assessments/:assessmentId/submit', requireAuth, submitMyAssessment);
