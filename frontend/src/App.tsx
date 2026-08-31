import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
const tokenKey = 'achievecell-auth-token';
const accountTypeKey = 'achievecell-account-type';
const themeStorageKey = 'achievecell-theme';
const internshipsStorageKey = 'achievecell-internships';
const shortlistedStorageKey = 'achievecell-shortlisted';
const appliedInternshipsKey = 'achievecell-applied-internships';
const sprintsStorageKey = 'achievecell-sprints';
const enrollmentsStorageKey = 'achievecell-enrollments';
const notificationsStorageKey = 'achievecell-notifications';

export type AccountType = 'student' | 'college' | 'company';

export type Career = {
  id: number;
  name: string;
  category: string;
  description?: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  education: string | null;
  year: number | null;
  targetRole: Career | null;
  accountType: AccountType;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  collegeName?: string;
  studentId?: string;
};

export type Skill = {
  skillId: number;
  skill: string;
  category: string;
  proficiency: number;
  source: string;
  lastAssessed: string | null;
};

export type Recommendation = {
  careerId: number;
  career: string;
  category: string;
  matchScore: number;
};

export type GapSkill = {
  skill: string;
  studentLevel: number;
  requiredLevel: number;
  gap: number;
  status: string;
  priority: string;
  priorityScore: number;
  matchPercentage: number;
};

export type Summary = {
  missingSkills: number;
  skillsToImprove: number;
  significantGaps: number;
  strongSkills: number;
};

export type Analysis = {
  career: Career;
  matchScore: number;
  summary: Summary;
  skills: GapSkill[];
};

export type DashboardData = {
  user: { id: number; name: string };
  targetRole: Career | null;
  profileStrength: number | null;
  skillsAssessed: number;
  skills: Skill[];
  recommendations: Recommendation[];
  skillGapSummary: Summary | null;
  targetAnalysis: Analysis | null;
};

export type AssessmentListItem = {
  id: number;
  title: string;
  skill: { id: number; name: string; category: string };
  _count: { questions: number };
};

export type Assessment = {
  id: number;
  title: string;
  skill: { id: number; name: string; category: string };
  questions: Array<{
    id: number;
    prompt: string;
    options: string[];
    order: number;
  }>;
};

export type AssessmentResult = {
  attempt: {
    score: number;
    previousProficiency: number;
    updatedProficiency: number;
  };
  skill: string;
  performance: string;
};

export type AiGuidance = {
  overview: string;
  strengths: string[];
  prioritySkills: Array<{
    skill: string;
    priority: string;
    reason: string;
  }>;
  nextSteps: string[];
};

export type SkillSprint = {
  id: number;
  title: string;
  skill: string;
  company: string;
  duration: string;
  enrolled: number;
  submitted: number;
  status: string;
};

export type StudentProject = {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
};

export type StudentProfileData = {
  id: number;
  name: string;
  email: string;
  college: string;
  degree: string;
  year: string;
  targetRole: string;
  bio: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  readiness: number;
  interests: string[];
  projects: StudentProject[];
  verifiedSkills: Array<{ skill: string; category: string; proficiency: number; status: string }>;
  completedSprints: string[];
};

export type Internship = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  duration: string;
  requiredSkills: string[];
  minProficiency: number;
  description: string;
  postedDate: string;
  applicantsCount: number;
};

export type RoleReadiness = {
  role: string;
  category: string;
  readinessRate: number;
  readyStudents: number;
  totalStudents: number;
  topSkill: string;
  accent: string;
};

export type RecommendedAction = {
  id: number;
  title: string;
  reason: string;
  skill: string;
  suggestedSprint: string;
  company: string;
  urgency: 'high' | 'medium';
};

export type NotificationItem = {
  id: number;
  recipientRole: 'student' | 'college' | 'company' | 'all';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'sprint' | 'internship' | 'submission' | 'general';
  actionLabel?: string;
  actionPayload?: {
    type: 'enroll_sprint' | 'apply_internship';
    targetId: number;
    title: string;
  };
};

export type RoadmapMilestone = {
  id: number;
  phase: string;
  timeline: string;
  title: string;
  description: string;
  skills: Array<{ name: string; proficiency: number; target: number }>;
  status: 'Completed' | 'In Progress' | 'Up Next';
  resources: Array<{ title: string; type: string; url: string }>;
};

export type ChatMessage = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; path: string }>;
};

const studentNavigation = [
  ['/dashboard', 'Dashboard', '⌂'],
  ['/recommendations', 'Career Recommendations', '↗'],
  ['/skills', 'Skills', '◈'],
  ['/skill-gap', 'Skill Gaps', '⌁'],
  ['/assessments', 'Skill Assessments', '✓'],
  ['/roadmap', 'AI Roadmap', '◇'],
  ['/internships', 'Internship Corner', '⌘'],
  ['/settings', 'Profile & Settings', '⚙'],
] as const;

const collegeNavigation = [
  ['/dashboard', 'College Dashboard', '⌂'],
  ['/sprints', 'Skill Sprints', '⌁'],
  ['/readiness', 'Role Readiness', '◇'],
  ['/students', 'Student Directory', '◈'],
  ['/settings', 'Institutional Settings', '⚙'],
] as const;

const companyNavigation = [
  ['/dashboard', 'Company Dashboard', '⌂'],
  ['/discovery', 'Talent Discovery', '◈'],
  ['/shortlist', 'Candidate Shortlist', '↗'],
  ['/internships', 'Post Internships', '⌘'],
  ['/settings', 'Recruiter Settings', '⚙'],
] as const;

const accountTypeOptions: Array<{ id: AccountType; title: string; detail: string }> = [
  { id: 'student', title: 'Student', detail: 'Assess skills and find career fit' },
  { id: 'college', title: 'College', detail: 'Track readiness and launch sprints' },
  { id: 'company', title: 'Company', detail: 'Shortlist verified sprint talent' },
];

const initialSprints: SkillSprint[] = [
  { id: 1, title: '7-Day SQL Task', skill: 'SQL', company: 'Infosys', duration: '7 days', enrolled: 42, submitted: 28, status: 'Active' },
  { id: 2, title: 'React Component Sprint', skill: 'React', company: 'Flipkart', duration: '10 days', enrolled: 31, submitted: 18, status: 'Active' },
  { id: 3, title: 'Git & Collaboration Week', skill: 'Git', company: 'TCS', duration: '7 days', enrolled: 56, submitted: 40, status: 'Active' },
  { id: 4, title: 'REST API & Express Sprint', skill: 'REST APIs', company: 'Swiggy', duration: '7 days', enrolled: 25, submitted: 15, status: 'Active' },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    recipientRole: 'student',
    title: 'New Skill Sprint: 7-Day SQL Task',
    message: 'Infosys requested proof of SQL fundamentals. Complete the sprint to qualify for direct shortlist.',
    timestamp: '10m ago',
    read: false,
    type: 'sprint',
    actionLabel: 'Enroll in Sprint',
    actionPayload: { type: 'enroll_sprint', targetId: 1, title: '7-Day SQL Task' },
  },
  {
    id: 2,
    recipientRole: 'student',
    title: 'New Internship: Full Stack Developer',
    message: 'Infosys is offering ₹25,000/mo for React & SQL verified candidates. Check your match score now.',
    timestamp: '1h ago',
    read: false,
    type: 'internship',
    actionLabel: 'Apply Now',
    actionPayload: { type: 'apply_internship', targetId: 1, title: 'Full Stack Developer Intern' },
  },
  {
    id: 3,
    recipientRole: 'college',
    title: 'New Internship Opportunity Posted',
    message: 'Flipkart posted Frontend UI/UX Engineering Intern. 35 students in your cohort meet the requirements.',
    timestamp: '2h ago',
    read: false,
    type: 'internship',
  },
  {
    id: 4,
    recipientRole: 'college',
    title: 'Skill Sprint Submission Received',
    message: 'Ananya Sharma submitted verified proof of work for the 7-Day SQL Task.',
    timestamp: '3h ago',
    read: false,
    type: 'submission',
  },
  {
    id: 5,
    recipientRole: 'company',
    title: 'New Candidate Shortlist Match',
    message: 'Priya Nair completed 7-Day SQL Task with a 92% verified proficiency score.',
    timestamp: '30m ago',
    read: false,
    type: 'submission',
  },
];

const mockStudentsDirectory: StudentProfileData[] = [
  {
    id: 1,
    name: 'Ananya Sharma',
    email: 'ananya.sharma@achievecell.demo',
    college: 'AchieveCell Institute of Technology',
    degree: 'B.Tech Computer Science & Engineering',
    year: 'Year 2',
    targetRole: 'Full Stack Developer',
    bio: 'Aspiring Full Stack Engineer passionate about distributed systems, React performance, and relational database schema design.',
    portfolioUrl: 'https://ananya-portfolio.dev',
    githubUrl: 'https://github.com/ananya-dev',
    linkedinUrl: 'https://linkedin.com/in/ananya-sharma',
    readiness: 78,
    interests: ['Full Stack Architecture', 'Database Optimization', 'Cloud Infrastructure', 'API Design'],
    projects: [
      {
        title: 'DevConnect Platform',
        description: 'Real-time developer collaboration portal with role-based auth, workspace threads, and automated code runner.',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Socket.io'],
      },
      {
        title: 'TaskFlow REST API',
        description: 'High-throughput microservice backend handling task queues with database indexing and automated testing suite.',
        techStack: ['Express.js', 'SQL', 'Docker', 'Jest'],
      },
    ],
    verifiedSkills: [
      { skill: 'SQL', category: 'Database', proficiency: 86, status: 'Strong' },
      { skill: 'Python', category: 'Programming', proficiency: 78, status: 'Strong' },
      { skill: 'Git', category: 'Tools', proficiency: 85, status: 'Strong' },
      { skill: 'JavaScript', category: 'Programming', proficiency: 72, status: 'Building confidence' },
      { skill: 'React', category: 'Frontend', proficiency: 65, status: 'Building confidence' },
    ],
    completedSprints: ['7-Day SQL Task', 'Git & Collaboration Week'],
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    email: 'rahul.mehta@achievecell.demo',
    college: 'AchieveCell Institute of Technology',
    degree: 'B.Tech Information Technology',
    year: 'Year 3',
    targetRole: 'Frontend Developer',
    bio: 'Frontend specialist focused on crafting highly accessible, performant component libraries and modern interactive web experiences.',
    portfolioUrl: 'https://rahul-frontend.design',
    githubUrl: 'https://github.com/rahulmehta',
    linkedinUrl: 'https://linkedin.com/in/rahul-mehta',
    readiness: 64,
    interests: ['Design Systems', 'Web Accessibility (a11y)', 'State Management', 'Micro-frontends'],
    projects: [
      {
        title: 'Accessible UI Component Library',
        description: 'Set of 40+ WCAG AAA compliant React components with customizable design tokens and keyboard navigation.',
        techStack: ['React', 'TypeScript', 'Storybook', 'Tailwind'],
      },
      {
        title: 'E-Commerce Interactive Catalog',
        description: 'Fast shopping interface with client-side filtering, instant search caching, and dynamic checkout validation.',
        techStack: ['React', 'Next.js', 'REST APIs'],
      },
    ],
    verifiedSkills: [
      { skill: 'React', category: 'Frontend', proficiency: 84, status: 'Strong' },
      { skill: 'JavaScript', category: 'Programming', proficiency: 82, status: 'Strong' },
      { skill: 'HTML & CSS', category: 'Frontend', proficiency: 90, status: 'Strong' },
      { skill: 'Git', category: 'Tools', proficiency: 75, status: 'Strong' },
      { skill: 'SQL', category: 'Database', proficiency: 54, status: 'Needs improvement' },
    ],
    completedSprints: ['React Component Sprint'],
  },
  {
    id: 3,
    name: 'Priya Nair',
    email: 'priya.nair@achievecell.demo',
    college: 'AchieveCell Institute of Technology',
    degree: 'B.Tech Computer Science & Engineering',
    year: 'Year 2',
    targetRole: 'Backend Developer',
    bio: 'Backend enthusiast dedicated to scalable database architectures, query performance, and resilient server-side services.',
    portfolioUrl: 'https://priyanair.me',
    githubUrl: 'https://github.com/priyanair-tech',
    linkedinUrl: 'https://linkedin.com/in/priya-nair',
    readiness: 82,
    interests: ['Relational Databases', 'Query Tuning', 'Distributed Caching', 'REST APIs'],
    projects: [
      {
        title: 'Smart Library DBMS',
        description: 'Normalized database structure for multi-campus libraries supporting complex aggregations and reservations.',
        techStack: ['SQL', 'PostgreSQL', 'Python', 'Flask'],
      },
      {
        title: 'Inventory Sync Service',
        description: 'Event-driven backend service synchronizing multi-warehouse inventory updates under concurrent read/writes.',
        techStack: ['Node.js', 'REST APIs', 'SQL', 'Redis'],
      },
    ],
    verifiedSkills: [
      { skill: 'SQL', category: 'Database', proficiency: 92, status: 'Strong' },
      { skill: 'Python', category: 'Programming', proficiency: 80, status: 'Strong' },
      { skill: 'Database Design', category: 'Database', proficiency: 88, status: 'Strong' },
      { skill: 'Git', category: 'Tools', proficiency: 82, status: 'Strong' },
      { skill: 'REST APIs', category: 'Backend', proficiency: 76, status: 'Strong' },
    ],
    completedSprints: ['7-Day SQL Task', 'Git & Collaboration Week'],
  },
  {
    id: 4,
    name: 'Meera Iyer',
    email: 'meera.iyer@achievecell.demo',
    college: 'AchieveCell Institute of Technology',
    degree: 'B.Sc Data Science & AI',
    year: 'Year 3',
    targetRole: 'Data Analyst',
    bio: 'Data practitioner with a deep passion for exploratory data analysis, business metric forecasting, and predictive modeling.',
    portfolioUrl: 'https://meera-data.io',
    githubUrl: 'https://github.com/meeraiyer',
    linkedinUrl: 'https://linkedin.com/in/meera-iyer',
    readiness: 88,
    interests: ['Exploratory Data Analysis', 'Statistical Inference', 'Predictive Modeling', 'Data Visualization'],
    projects: [
      {
        title: 'Healthcare Analytics Dashboard',
        description: 'Interactive analytics dashboard visualising patient readmission risk factors using statistical distributions.',
        techStack: ['Python', 'Pandas', 'SQL', 'Plotly'],
      },
      {
        title: 'Customer Churn Predictor',
        description: 'End-to-end classification pipeline identifying high-risk subscription churn with 91% recall score.',
        techStack: ['Python', 'NumPy', 'Scikit-Learn', 'Pandas'],
      },
    ],
    verifiedSkills: [
      { skill: 'Python', category: 'Programming', proficiency: 90, status: 'Strong' },
      { skill: 'SQL', category: 'Database', proficiency: 91, status: 'Strong' },
      { skill: 'Pandas', category: 'Data Science', proficiency: 88, status: 'Strong' },
      { skill: 'Data Visualization', category: 'Data Science', proficiency: 84, status: 'Strong' },
      { skill: 'Git', category: 'Tools', proficiency: 78, status: 'Strong' },
    ],
    completedSprints: ['7-Day SQL Task'],
  },
  {
    id: 5,
    name: 'Arjun Patel',
    email: 'arjun.patel@achievecell.demo',
    college: 'AchieveCell Institute of Technology',
    degree: 'B.Tech Computer Science & Engineering',
    year: 'Year 4',
    targetRole: 'Cloud & DevOps Engineer',
    bio: 'Cloud and automation enthusiast building automated build pipelines, containerized environments, and server monitoring.',
    portfolioUrl: 'https://arjun-cloud.dev',
    githubUrl: 'https://github.com/arjunpatel',
    linkedinUrl: 'https://linkedin.com/in/arjun-patel',
    readiness: 51,
    interests: ['Container Orchestration', 'CI/CD Pipelines', 'Cloud Architecture', 'Linux Administration'],
    projects: [
      {
        title: 'AutoDeploy Multi-Environment Pipeline',
        description: 'Automated GitHub Actions CI/CD pipeline deploying containerized microservices to cloud staging clusters.',
        techStack: ['Docker', 'Git', 'Linux', 'AWS'],
      },
      {
        title: 'Server Telemetry Dispatcher',
        description: 'Lightweight daemon aggregating host metrics, disk I/O, and memory pressure to dispatch alerts.',
        techStack: ['Node.js', 'Linux', 'REST APIs'],
      },
    ],
    verifiedSkills: [
      { skill: 'Git', category: 'Tools', proficiency: 86, status: 'Strong' },
      { skill: 'Linux', category: 'Cloud', proficiency: 82, status: 'Strong' },
      { skill: 'Docker', category: 'DevOps', proficiency: 78, status: 'Strong' },
      { skill: 'Node.js', category: 'Backend', proficiency: 72, status: 'Building confidence' },
      { skill: 'SQL', category: 'Database', proficiency: 48, status: 'Needs improvement' },
    ],
    completedSprints: ['Git & Collaboration Week'],
  },
];

const defaultInternships: Internship[] = [
  {
    id: 1,
    title: 'Full Stack Developer Intern',
    company: 'Infosys',
    location: 'Bangalore · Hybrid',
    type: 'Full-Time Internship',
    stipend: '₹25,000 / month',
    duration: '6 Months',
    requiredSkills: ['React', 'Node.js', 'SQL', 'Git'],
    minProficiency: 65,
    description: 'Work alongside enterprise product teams building cloud-native web portals. Build performant user interfaces in React and robust RESTful services.',
    postedDate: '2 days ago',
    applicantsCount: 42,
  },
  {
    id: 2,
    title: 'Frontend UI/UX Engineering Intern',
    company: 'Flipkart',
    location: 'Remote',
    type: 'Part-Time / Flexible',
    stipend: '₹35,000 / month',
    duration: '3 Months',
    requiredSkills: ['React', 'JavaScript', 'HTML & CSS'],
    minProficiency: 70,
    description: 'Join our customer experience pod to create snappy, responsive user flows. Implement accessible UI components and optimize browser rendering speed.',
    postedDate: '1 day ago',
    applicantsCount: 68,
  },
  {
    id: 3,
    title: 'Data & Analytics Intern',
    company: 'TCS Innovation Labs',
    location: 'Pune · Hybrid',
    type: 'Full-Time Internship',
    stipend: '₹22,000 / month',
    duration: '6 Months',
    requiredSkills: ['SQL', 'Python', 'Data Visualization'],
    minProficiency: 65,
    description: 'Analyze operational datasets, build automated reporting dashboards, and assist data engineers in schema normalization and query tuning.',
    postedDate: '3 days ago',
    applicantsCount: 31,
  },
  {
    id: 4,
    title: 'Backend Platform Engineer Intern',
    company: 'Swiggy',
    location: 'Bangalore · On-site',
    type: 'Full-Time Internship',
    stipend: '₹30,000 / month',
    duration: '6 Months',
    requiredSkills: ['Node.js', 'SQL', 'REST APIs', 'Git'],
    minProficiency: 70,
    description: 'Design and optimize core API endpoints handling transaction updates, caching layer integration, and database schema migrations.',
    postedDate: 'Just now',
    applicantsCount: 19,
  },
];

const defaultRoleReadiness: RoleReadiness[] = [
  { role: 'Full Stack Developer', category: 'Software Development', readinessRate: 54, readyStudents: 32, totalStudents: 59, topSkill: 'SQL & React', accent: 'violet' },
  { role: 'Software Engineer', category: 'Software Development', readinessRate: 45, readyStudents: 27, totalStudents: 60, topSkill: 'Algorithms & Git', accent: 'blue' },
  { role: 'Data Analyst', category: 'Data Science', readinessRate: 62, readyStudents: 31, totalStudents: 50, topSkill: 'Python & SQL', accent: 'green' },
  { role: 'Frontend Developer', category: 'Software Development', readinessRate: 58, readyStudents: 35, totalStudents: 60, topSkill: 'React & CSS', accent: 'orange' },
  { role: 'Cloud & DevOps Engineer', category: 'Infrastructure', readinessRate: 32, readyStudents: 19, totalStudents: 59, topSkill: 'Linux & Docker', accent: 'red' },
];

const defaultRecommendedActions: RecommendedAction[] = [
  {
    id: 1,
    title: 'Action Required: 60% of students lack SQL proficiency',
    reason: 'SQL is required by 4 hiring partner postings. Conducting a 7-day SQL Skill Sprint will boost placement eligibility by 34%.',
    skill: 'SQL',
    suggestedSprint: '7-Day SQL Task',
    company: 'Infosys',
    urgency: 'high',
  },
  {
    id: 2,
    title: 'Opportunity: React & Component Architecture',
    reason: 'Frontend job openings have increased by 40%. A focused React Sprint will help 31 students reach the 75%+ threshold.',
    skill: 'React',
    suggestedSprint: 'React Component Sprint',
    company: 'Flipkart',
    urgency: 'medium',
  },
  {
    id: 3,
    title: 'Action Required: Git Collaboration & Team Workflow',
    reason: 'Corporate recruiters expect verified version control experience before scheduling direct interviews.',
    skill: 'Git',
    suggestedSprint: 'Git & Collaboration Week',
    company: 'TCS',
    urgency: 'medium',
  },
];

const defaultCareers: Career[] = [
  { id: 1, name: 'Full Stack Developer', category: 'Software Development', description: 'Builds complete web applications across frontend, backend, and data layers.' },
  { id: 2, name: 'Frontend Developer', category: 'Software Development', description: 'Creates accessible, responsive, and maintainable user interfaces.' },
  { id: 3, name: 'Backend Developer', category: 'Software Development', description: 'Designs server-side services, APIs, and data access layers.' },
  { id: 4, name: 'Data Analyst', category: 'Data Science', description: 'Extracts insights, creates dashboards, and performs statistical analysis.' },
  { id: 5, name: 'Cloud & DevOps Engineer', category: 'Cloud & Infrastructure', description: 'Builds CI/CD pipelines, automates cloud infrastructure, and manages containers.' },
  { id: 6, name: 'AI / Machine Learning Engineer', category: 'Artificial Intelligence', description: 'Develops predictive models, data pipelines, and integrates intelligent systems.' },
];

const defaultSkills: Skill[] = [
  { skillId: 1, skill: 'Python', category: 'Programming', proficiency: 75, source: 'assessment', lastAssessed: new Date().toISOString() },
  { skillId: 2, skill: 'SQL', category: 'Database', proficiency: 82, source: 'assessment', lastAssessed: new Date().toISOString() },
  { skillId: 3, skill: 'JavaScript', category: 'Programming', proficiency: 68, source: 'assessment', lastAssessed: new Date().toISOString() },
  { skillId: 4, skill: 'React', category: 'Frontend', proficiency: 58, source: 'self_reported', lastAssessed: null },
  { skillId: 5, skill: 'Git', category: 'Tools', proficiency: 74, source: 'assessment', lastAssessed: new Date().toISOString() },
  { skillId: 6, skill: 'HTML & CSS', category: 'Frontend', proficiency: 85, source: 'assessment', lastAssessed: new Date().toISOString() },
  { skillId: 7, skill: 'REST APIs', category: 'Backend', proficiency: 62, source: 'self_reported', lastAssessed: null },
];

const defaultRoadmapMilestones: RoadmapMilestone[] = [
  {
    id: 1,
    phase: 'Phase 1 · Weeks 1–2',
    timeline: 'Completed',
    title: 'Foundational Data Modeling & Query Mastery',
    description: 'Master relational schema normalization, complex SQL joins, indexing strategies, and database query profiling.',
    skills: [
      { name: 'SQL', proficiency: 82, target: 70 },
      { name: 'Git', proficiency: 74, target: 60 },
    ],
    status: 'Completed',
    resources: [
      { title: 'PostgreSQL Relational Design Docs', type: 'Documentation', url: 'https://postgresql.org/docs' },
      { title: 'Interactive SQL Sandbox & LeetCode DB', type: 'Practice Lab', url: 'https://leetcode.com' },
    ],
  },
  {
    id: 2,
    phase: 'Phase 2 · Weeks 3–4',
    timeline: 'In Progress (Active Focus)',
    title: 'Modern Frontend & Component Architecture',
    description: 'Build responsive, accessible user interfaces in React. Implement custom hooks, memoization, and client-side data caching.',
    skills: [
      { name: 'React', proficiency: 58, target: 75 },
      { name: 'JavaScript ES6+', proficiency: 68, target: 80 },
    ],
    status: 'In Progress',
    resources: [
      { title: 'React.dev Official State Patterns', type: 'Guide', url: 'https://react.dev' },
      { title: 'TypeScript Component Architecture Sandbox', type: 'Interactive', url: 'https://typescriptlang.org' },
    ],
  },
  {
    id: 3,
    phase: 'Phase 3 · Weeks 5–6',
    timeline: 'Up Next',
    title: 'Server Architectures & RESTful API Engineering',
    description: 'Design robust backend services with Express/Node.js, implement JWT session security, and optimize data endpoints.',
    skills: [
      { name: 'REST APIs', proficiency: 62, target: 70 },
      { name: 'Node.js', proficiency: 45, target: 70 },
    ],
    status: 'Up Next',
    resources: [
      { title: 'Prisma ORM & PostgreSQL Integration', type: 'Workshop', url: 'https://prisma.io' },
      { title: 'RESTful API RFC Standards & Middleware Design', type: 'Specification', url: 'https://restfulapi.net' },
    ],
  },
  {
    id: 4,
    phase: 'Phase 4 · Weeks 7–8',
    timeline: 'Up Next',
    title: 'Full Stack Integration, Containers & Cloud CI/CD',
    description: 'Deploy full-stack microservices with Docker containerization, automated testing suites, and production monitoring.',
    skills: [
      { name: 'Docker & Containers', proficiency: 40, target: 65 },
      { name: 'CI/CD Automation', proficiency: 35, target: 60 },
    ],
    status: 'Up Next',
    resources: [
      { title: 'Docker Official Getting Started Lab', type: 'Hands-on', url: 'https://docker.com' },
      { title: 'GitHub Actions Continuous Delivery Pipeline', type: 'Tutorial', url: 'https://docs.github.com' },
    ],
  },
];

const mockAssessmentsData: Record<number, Assessment> = {
  1: {
    id: 1,
    title: 'SQL Fundamentals & Queries',
    skill: { id: 1, name: 'SQL', category: 'Database' },
    questions: [
      { id: 101, prompt: 'Which clause is used to filter grouped results in a SQL query?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], order: 1 },
      { id: 102, prompt: 'What type of join returns all rows from the left table and matched rows from the right?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL JOIN', 'CROSS JOIN'], order: 2 },
      { id: 103, prompt: 'Which SQL command is used to add new rows to a table?', options: ['INSERT INTO', 'ADD ROW', 'UPDATE', 'CREATE'], order: 3 },
      { id: 104, prompt: 'What constraint uniquely identifies each record in a relational database table?', options: ['FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY', 'CHECK'], order: 4 },
    ],
  },
  2: {
    id: 2,
    title: 'React Hooks & State Management',
    skill: { id: 2, name: 'React', category: 'Frontend' },
    questions: [
      { id: 201, prompt: 'Which hook should you use to run side effects in a functional React component?', options: ['useState', 'useEffect', 'useMemo', 'useContext'], order: 1 },
      { id: 202, prompt: 'What is the purpose of the key prop when rendering lists in React?', options: ['To style list items', 'To help React identify which items have changed', 'To encrypt component state', 'To make items focusable'], order: 2 },
      { id: 203, prompt: 'How do you pass data from a parent to a child component in React?', options: ['Via Props', 'Via Redux only', 'Via HTML attributes', 'Via State lifting only'], order: 3 },
      { id: 204, prompt: 'Which hook memoizes a computed value between renders?', options: ['useCallback', 'useMemo', 'useRef', 'useReducer'], order: 4 },
    ],
  },
  3: {
    id: 3,
    title: 'JavaScript ES6+ Concepts',
    skill: { id: 3, name: 'JavaScript', category: 'Programming' },
    questions: [
      { id: 301, prompt: 'What is the output of typeof null in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"number"'], order: 1 },
      { id: 302, prompt: 'Which array method creates a new array with all elements that pass a test?', options: ['map()', 'filter()', 'forEach()', 'reduce()'], order: 2 },
      { id: 303, prompt: 'What is a closure in JavaScript?', options: ['A function having access to its parent lexical scope', 'A way to close browser tabs', 'A method to freeze objects', 'An asynchronous loop'], order: 3 },
      { id: 304, prompt: 'What keyword handles rejected promises in async/await syntax?', options: ['catch / try...catch', 'reject', 'defer', 'finally only'], order: 4 },
    ],
  },
  4: {
    id: 4,
    title: 'Python Programming Essentials',
    skill: { id: 4, name: 'Python', category: 'Programming' },
    questions: [
      { id: 401, prompt: 'Which data structure in Python is mutable and ordered?', options: ['Tuple', 'List', 'Set', 'FrozenSet'], order: 1 },
      { id: 402, prompt: 'What is used to define a generator function in Python?', options: ['return', 'yield', 'async', 'lambda'], order: 2 },
      { id: 403, prompt: 'Which built-in module is used for JSON serialization in Python?', options: ['json', 'marshal', 'pickle', 'urllib'], order: 3 },
      { id: 404, prompt: 'What is the purpose of the __init__ method in a Python class?', options: ['To destroy instances', 'To initialize object attributes upon creation', 'To define static methods', 'To import modules'], order: 4 },
    ],
  },
  5: {
    id: 5,
    title: 'Git & Version Control Workflow',
    skill: { id: 5, name: 'Git', category: 'Tools' },
    questions: [
      { id: 501, prompt: 'Which command creates and switches to a new Git branch in one step?', options: ['git branch -n', 'git checkout -b <name>', 'git merge <name>', 'git switch --all'], order: 1 },
      { id: 502, prompt: 'What command stages modified files for the next commit?', options: ['git push', 'git commit', 'git add', 'git stash'], order: 2 },
      { id: 503, prompt: 'How do you incorporate changes from one branch into another?', options: ['git merge', 'git pull --force', 'git clone', 'git diff'], order: 3 },
      { id: 504, prompt: 'Which command shows commit history with graph and oneline format?', options: ['git status', 'git log --oneline --graph', 'git reflog', 'git show'], order: 4 },
    ],
  },
};

function readStoredAccountType(): AccountType {
  const stored = localStorage.getItem(accountTypeKey);
  return stored === 'college' || stored === 'company' || stored === 'student' ? stored : 'student';
}

function withAccountType(
  user: Omit<User, 'accountType'> & { accountType?: AccountType },
  accountType = readStoredAccountType(),
): User {
  return {
    ...user,
    education: user.education ?? 'B.Tech CSE',
    year: user.year ?? 2,
    targetRole: user.targetRole ?? defaultCareers[0],
    accountType,
    linkedinUrl: user.linkedinUrl ?? 'https://linkedin.com/in/ananya-sharma',
    githubUrl: user.githubUrl ?? 'https://github.com/ananya-dev',
    portfolioUrl: user.portfolioUrl ?? 'https://ananya-portfolio.dev',
    collegeName: user.collegeName ?? 'AchieveCell Institute of Technology',
    studentId: user.studentId ?? 'ACIT-2024-CSE-042',
  };
}

function navigate(path: string): void {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function getStoredInternships(): Internship[] {
  try {
    const raw = localStorage.getItem(internshipsStorageKey);
    return raw ? (JSON.parse(raw) as Internship[]) : defaultInternships;
  } catch {
    return defaultInternships;
  }
}

function saveStoredInternships(list: Internship[]): void {
  try {
    localStorage.setItem(internshipsStorageKey, JSON.stringify(list));
  } catch {}
}

function getStoredShortlisted(): number[] {
  try {
    const raw = localStorage.getItem(shortlistedStorageKey);
    return raw ? (JSON.parse(raw) as number[]) : [1, 2];
  } catch {
    return [1, 2];
  }
}

function saveStoredShortlisted(ids: number[]): void {
  try {
    localStorage.setItem(shortlistedStorageKey, JSON.stringify(ids));
  } catch {}
}

function getStoredApplied(): number[] {
  try {
    const raw = localStorage.getItem(appliedInternshipsKey);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveStoredApplied(ids: number[]): void {
  try {
    localStorage.setItem(appliedInternshipsKey, JSON.stringify(ids));
  } catch {}
}

function getStoredSprints(): SkillSprint[] {
  try {
    const raw = localStorage.getItem(sprintsStorageKey);
    return raw ? (JSON.parse(raw) as SkillSprint[]) : initialSprints;
  } catch {
    return initialSprints;
  }
}

function saveStoredSprints(list: SkillSprint[]): void {
  try {
    localStorage.setItem(sprintsStorageKey, JSON.stringify(list));
  } catch {}
}

function getStoredEnrollments(): number[] {
  try {
    const raw = localStorage.getItem(enrollmentsStorageKey);
    return raw ? (JSON.parse(raw) as number[]) : [1, 3];
  } catch {
    return [1, 3];
  }
}

function saveStoredEnrollments(list: number[]): void {
  try {
    localStorage.setItem(enrollmentsStorageKey, JSON.stringify(list));
  } catch {}
}

function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(notificationsStorageKey);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : initialNotifications;
  } catch {
    return initialNotifications;
  }
}

function saveStoredNotifications(list: NotificationItem[]): void {
  try {
    localStorage.setItem(notificationsStorageKey, JSON.stringify(list));
  } catch {}
}

function getLocalSkills(): Skill[] {
  try {
    const raw = localStorage.getItem('achievecell-mock-skills');
    return raw ? (JSON.parse(raw) as Skill[]) : defaultSkills;
  } catch {
    return defaultSkills;
  }
}

function saveLocalSkills(skills: Skill[]): void {
  try {
    localStorage.setItem('achievecell-mock-skills', JSON.stringify(skills));
  } catch {}
}

function getLocalUser(accountType: AccountType): User {
  try {
    const raw = localStorage.getItem('achievecell-mock-user');
    if (raw) {
      const parsed = JSON.parse(raw) as User;
      return { ...parsed, accountType };
    }
  } catch {}
  return {
    id: 1,
    name: accountType === 'college' ? 'AchieveCell Institute' : accountType === 'company' ? 'Infosys Talent Partner' : 'Ananya Sharma',
    email: 'ananya.sharma@achievecell.demo',
    education: 'B.Tech CSE',
    year: 2,
    targetRole: defaultCareers[0],
    accountType,
    linkedinUrl: 'https://linkedin.com/in/ananya-sharma',
    githubUrl: 'https://github.com/ananya-dev',
    portfolioUrl: 'https://ananya-portfolio.dev',
    collegeName: 'AchieveCell Institute of Technology',
    studentId: 'ACIT-2024-CSE-042',
  };
}

function fallbackMockRequest<T>(path: string, options: RequestInit = {}): T {
  const accountType = readStoredAccountType();
  const user = getLocalUser(accountType);
  const skills = getLocalSkills();

  if (path === '/auth/login' || path === '/auth/register') {
    let name = 'Ananya Sharma';
    let email = 'ananya.sharma@achievecell.demo';
    let edu = 'B.Tech CSE';
    let yr = 2;
    if (options.body) {
      try {
        const parsed = JSON.parse(String(options.body)) as { name?: string; email?: string; education?: string; year?: number };
        if (parsed.name) name = parsed.name;
        if (parsed.email) email = parsed.email;
        if (parsed.education) edu = parsed.education;
        if (parsed.year) yr = parsed.year;
      } catch {}
    }
    const updatedUser: User = { ...user, name, email, education: edu, year: yr, accountType };
    localStorage.setItem('achievecell-mock-user', JSON.stringify(updatedUser));
    return { token: 'demo-sih-mock-token-2026', user: updatedUser } as T;
  }

  if (path === '/me') return user as T;
  if (path === '/careers') return defaultCareers as T;
  if (path === '/me/skills') return skills as T;

  if (path === '/me/target-role' && options.method === 'PATCH') {
    let targetRoleId = 1;
    if (options.body) {
      try {
        const parsed = JSON.parse(String(options.body)) as { targetRoleId: number };
        targetRoleId = parsed.targetRoleId;
      } catch {}
    }
    const chosen = defaultCareers.find((c) => c.id === targetRoleId) ?? defaultCareers[0];
    const updatedUser = { ...user, targetRole: chosen };
    localStorage.setItem('achievecell-mock-user', JSON.stringify(updatedUser));
    return { id: user.id, name: user.name, targetRole: chosen } as T;
  }

  if (path === '/me/ai-recommendation') {
    const ai: AiGuidance = {
      overview: 'Your foundations in SQL, Git, and Python are strong. Building deeper proficiency in React and REST APIs will significantly boost your Full Stack readiness.',
      strengths: ['SQL', 'Git', 'Python'],
      prioritySkills: [
        { skill: 'React', priority: 'High', reason: 'Critical frontend framework needed to reach 80%+ readiness for your target role.' },
        { skill: 'REST APIs', priority: 'Medium', reason: 'Essential for connecting client interfaces with backend service architectures.' },
      ],
      nextSteps: ['Complete the React Assessment', 'Apply to the Infosys Full Stack Developer Internship'],
    };
    return ai as T;
  }

  if (path === '/me/dashboard') {
    const avgScore = Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / (skills.length || 1));
    const recommendations: Recommendation[] = [
      { careerId: 1, career: 'Full Stack Developer', category: 'Software Development', matchScore: Math.min(100, Math.round(avgScore * 1.05)) },
      { careerId: 2, career: 'Frontend Developer', category: 'Software Development', matchScore: Math.min(100, Math.round(avgScore * 1.12)) },
      { careerId: 3, career: 'Backend Developer', category: 'Software Development', matchScore: Math.min(100, Math.round(avgScore * 0.95)) },
      { careerId: 4, career: 'Data Analyst', category: 'Data Science', matchScore: Math.min(100, Math.round(avgScore * 0.88)) },
    ];
    const summary: Summary = { missingSkills: 1, skillsToImprove: 2, significantGaps: 1, strongSkills: skills.filter((s) => s.proficiency >= 70).length };
    const dashboard: DashboardData = {
      user: { id: user.id, name: user.name },
      targetRole: user.targetRole ?? defaultCareers[0],
      profileStrength: Math.min(100, Math.round(avgScore * 1.05)),
      skillsAssessed: skills.length,
      skills,
      recommendations,
      skillGapSummary: summary,
      targetAnalysis: null,
    };
    return dashboard as T;
  }

  if (path.startsWith('/me/career-analysis/')) {
    const careerId = Number(path.split('/').pop()) || 1;
    const career = defaultCareers.find((c) => c.id === careerId) ?? defaultCareers[0];
    const gapSkills: GapSkill[] = [
      { skill: 'JavaScript', studentLevel: skills.find((s) => s.skill === 'JavaScript')?.proficiency ?? 68, requiredLevel: 80, gap: 12, status: 'Building confidence', priority: 'High', priorityScore: 90, matchPercentage: 85 },
      { skill: 'React', studentLevel: skills.find((s) => s.skill === 'React')?.proficiency ?? 58, requiredLevel: 75, gap: 17, status: 'Building confidence', priority: 'High', priorityScore: 85, matchPercentage: 77 },
      { skill: 'SQL', studentLevel: skills.find((s) => s.skill === 'SQL')?.proficiency ?? 82, requiredLevel: 65, gap: 0, status: 'Strong', priority: 'Low', priorityScore: 40, matchPercentage: 100 },
      { skill: 'Git', studentLevel: skills.find((s) => s.skill === 'Git')?.proficiency ?? 74, requiredLevel: 60, gap: 0, status: 'Strong', priority: 'Low', priorityScore: 35, matchPercentage: 100 },
      { skill: 'REST APIs', studentLevel: skills.find((s) => s.skill === 'REST APIs')?.proficiency ?? 62, requiredLevel: 70, gap: 8, status: 'Building confidence', priority: 'Medium', priorityScore: 65, matchPercentage: 88 },
      { skill: 'Node.js', studentLevel: skills.find((s) => s.skill === 'Node.js')?.proficiency ?? 0, requiredLevel: 70, gap: 70, status: 'Missing', priority: 'High', priorityScore: 92, matchPercentage: 0 },
    ];
    const strongCount = gapSkills.filter((s) => s.status === 'Strong').length;
    const missingCount = gapSkills.filter((s) => s.status === 'Missing').length;
    const improveCount = gapSkills.filter((s) => s.status === 'Building confidence').length;
    const overallMatch = Math.round(gapSkills.reduce((acc, s) => acc + s.matchPercentage, 0) / gapSkills.length);
    const analysis: Analysis = {
      career,
      matchScore: overallMatch,
      summary: { missingSkills: missingCount, skillsToImprove: improveCount, significantGaps: 1, strongSkills: strongCount },
      skills: gapSkills,
    };
    return analysis as T;
  }

  if (path === '/assessments') {
    const list: AssessmentListItem[] = Object.values(mockAssessmentsData).map((a) => ({
      id: a.id,
      title: a.title,
      skill: a.skill,
      _count: { questions: a.questions.length },
    }));
    return list as T;
  }

  if (path.startsWith('/assessments/skill/')) {
    const skillId = Number(path.split('/').pop()) || 1;
    const assessment = mockAssessmentsData[skillId] ?? mockAssessmentsData[1];
    return assessment as T;
  }

  if (path.includes('/submit') && options.method === 'POST') {
    const assessmentId = Number(path.split('/')[2]) || 1;
    const assessment = mockAssessmentsData[assessmentId] ?? mockAssessmentsData[1];
    const skillName = assessment.skill.name;
    const existing = skills.find((s) => s.skill.toLowerCase() === skillName.toLowerCase());
    const prevProf = existing ? existing.proficiency : 50;
    const newProf = Math.min(100, Math.max(75, prevProf + 15));
    const nextSkills = skills.some((s) => s.skill.toLowerCase() === skillName.toLowerCase())
      ? skills.map((s) => (s.skill.toLowerCase() === skillName.toLowerCase() ? { ...s, proficiency: newProf, source: 'assessment', lastAssessed: new Date().toISOString() } : s))
      : [...skills, { skillId: Date.now(), skill: skillName, category: assessment.skill.category, proficiency: newProf, source: 'assessment', lastAssessed: new Date().toISOString() }];
    saveLocalSkills(nextSkills);
    const result: AssessmentResult = {
      attempt: { score: 90, previousProficiency: prevProf, updatedProficiency: newProf },
      skill: skillName,
      performance: 'Strong',
    };
    return result as T;
  }

  return {} as T;
}

async function request<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    const data = (await response.json().catch(() => null)) as T & { error?: { message?: string } };
    if (!response.ok) {
      if (response.status === 500 || data?.error?.message?.includes('database')) {
        return fallbackMockRequest<T>(path, options);
      }
      throw new Error(data?.error?.message ?? 'Something went wrong. Please try again.');
    }
    return data;
  } catch {
    return fallbackMockRequest<T>(path, options);
  }
}

function skillLabel(proficiency: number): string {
  return proficiency >= 70 ? 'Strong' : proficiency >= 40 ? 'Building confidence' : 'Needs improvement';
}

function badgeTone(label: string): string {
  return label.toLowerCase().replaceAll(' ', '-');
}

function routeKey(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function ProgressBar({ value, tone = 'default' }: { value: number; tone?: string }): ReactElement {
  return (
    <div className={`progress-track ${tone}`} aria-label={`${value}% progress`}>
      <span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  );
}

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }): ReactElement {
  const toneClass = typeof children === 'string' ? badgeTone(children) : '';
  return <span className={`badge ${tone ?? toneClass}`}>{children}</span>;
}

export function Loading({ message = 'Loading your AchieveCell experience…' }: { message?: string }): ReactElement {
  return (
    <div className="page-state">
      <span className="loading-orb" />
      {message}
    </div>
  );
}

export function ErrorState({ message, action }: { message: string; action?: ReactElement }): ReactElement {
  return (
    <div className="page-state error-state">
      <strong>We couldn’t load this yet.</strong>
      <span>{message}</span>
      {action}
    </div>
  );
}

export function Empty({
  title,
  text,
  action,
  path,
  onAction,
}: {
  title: string;
  text: string;
  action: string;
  path?: string;
  onAction?: () => void;
}): ReactElement {
  return (
    <div className="empty">
      <span className="empty-icon">✦</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <button
        className="secondary-button"
        onClick={() => {
          if (onAction) onAction();
          else if (path) navigate(path);
        }}
      >
        {action}
      </button>
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  accent = 'blue',
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}): ReactElement {
  return (
    <section className={`metric-card ${accent}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </section>
  );
}

export function SkillRow({ skill }: { skill: Skill }): ReactElement {
  const label = skillLabel(skill.proficiency);
  return (
    <div className="skill-row">
      <div className="skill-meta">
        <strong>{skill.skill}</strong>
        <small>{skill.category}</small>
      </div>
      <div className="skill-progress">
        <ProgressBar value={skill.proficiency} tone={badgeTone(label)} />
      </div>
      <b>{skill.proficiency}%</b>
      <Badge>{label}</Badge>
    </div>
  );
}

export function SummaryItem({ label, value, tone }: { label: string; value: number; tone: string }): ReactElement {
  return (
    <div className="summary-item">
      <span className={`summary-dot ${tone}`} />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function RecommendationRow({ item, index }: { item: Recommendation; index: number }): ReactElement {
  return (
    <button className="recommendation" onClick={() => navigate(`/skill-gap?career=${item.careerId}`)}>
      <span className="rank">0{index + 1}</span>
      <span>
        <strong>{item.career}</strong>
        <small>{item.category}</small>
      </span>
      <span className="recommendation-score">
        <b>{item.matchScore}%</b>
        <ProgressBar value={item.matchScore} />
      </span>
    </button>
  );
}

export function GapCard({ skill }: { skill: GapSkill }): ReactElement {
  return (
    <article className={`gap-card ${badgeTone(skill.status)}`}>
      <div className="gap-card-head">
        <div>
          <h3>{skill.skill}</h3>
          <p>{skill.status === 'Strong' ? 'You meet this role’s expected level.' : 'Build this skill toward the role requirement.'}</p>
        </div>
        <Badge>{skill.status}</Badge>
      </div>
      <div className="gap-levels">
        <span>
          <small>Your level</small>
          <b>{skill.studentLevel}%</b>
        </span>
        <span>
          <small>Role needs</small>
          <b>{skill.requiredLevel}%</b>
        </span>
        <span>
          <small>Gap</small>
          <b>{skill.gap}</b>
        </span>
      </div>
      <ProgressBar value={skill.studentLevel} tone={badgeTone(skill.status)} />
      <div className="gap-card-foot">
        <span>Match contribution: {skill.matchPercentage}%</span>
        <Badge>{`${skill.priority} priority`}</Badge>
      </div>
    </article>
  );
}

export function AssessmentResultCard({ result }: { result: AssessmentResult }): ReactElement {
  const nextAction =
    result.performance === 'Strong'
      ? 'Great work — put this skill into a project, then assess another important skill.'
      : result.performance === 'Intermediate'
        ? 'You have a good base. Review the topics you missed, practise, and retake this assessment when ready.'
        : 'Start with the fundamentals for this skill, then return for another assessment.';

  return (
    <div className="result-card">
      <span className={`result-emblem ${badgeTone(result.performance)}`}>
        {result.performance === 'Strong' ? '★' : result.performance === 'Intermediate' ? '↗' : '✦'}
      </span>
      <p className="eyebrow">Assessment complete</p>
      <h1>{result.skill} result</h1>
      <strong className="result-score">{result.attempt.score}%</strong>
      <Badge>{result.performance}</Badge>
      <div className="result-comparison">
        <span>
          Previous level <b>{result.attempt.previousProficiency}%</b>
        </span>
        <span>
          New verified level <b>{result.attempt.updatedProficiency}%</b>
        </span>
      </div>
      <section className="result-next">
        <h2>What this means</h2>
        <p>{nextAction}</p>
      </section>
      <div className="button-row">
        <button className="primary-button" onClick={() => navigate('/dashboard')}>
          See updated dashboard
        </button>
        <button className="secondary-button" onClick={() => navigate('/skill-gap')}>
          View skill gaps
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   Notification Center Component
   ========================================================================= */
export function NotificationDropdown({
  notifications,
  accountType,
  onClose,
  onAction,
  onMarkAllRead,
}: {
  notifications: NotificationItem[];
  accountType: AccountType;
  onClose: () => void;
  onAction: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
}): ReactElement {
  const relevant = notifications.filter(
    (n) => n.recipientRole === accountType || n.recipientRole === 'all',
  );

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        top: '4.2rem',
        right: '1.5rem',
        width: 'min(90vw, 24rem)',
        maxHeight: '32rem',
        overflowY: 'auto',
        zIndex: 100,
        boxShadow: '0 12px 36px rgba(18, 32, 68, 0.18)',
        border: '1px solid #d9e1f5',
        padding: '1.2rem',
      }}
    >
      <div className="card-heading" style={{ marginBottom: '.8rem' }}>
        <div>
          <p className="section-kicker">Real-time alerts</p>
          <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Notification Center</h2>
        </div>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          <button className="text-button" style={{ fontSize: '.75rem' }} onClick={onMarkAllRead}>
            Mark read
          </button>
          <button className="text-button" style={{ fontSize: '.85rem' }} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '.75rem' }}>
        {relevant.length ? (
          relevant.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '.8rem',
                borderRadius: '.6rem',
                border: '1px solid',
                borderColor: item.read ? '#e5e9f2' : '#c3d2f8',
                background: item.read ? '#fcfdff' : '#f0f4ff',
                display: 'grid',
                gap: '.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '.84rem', color: '#25355e' }}>{item.title}</strong>
                <small style={{ color: '#7e8ba6', fontSize: '.68rem' }}>{item.timestamp}</small>
              </div>
              <p style={{ margin: 0, fontSize: '.78rem', color: '#576686', lineHeight: 1.45 }}>
                {item.message}
              </p>
              {item.actionLabel && (
                <div style={{ marginTop: '.4rem' }}>
                  <button
                    className="primary-button"
                    style={{ padding: '.4rem .8rem', fontSize: '.75rem' }}
                    onClick={() => onAction(item)}
                  >
                    {item.actionLabel} →
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ margin: '1rem 0', textAlign: 'center', color: '#7c88a3', fontSize: '.82rem' }}>
            No new notifications for your account.
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   Always-On AI Assistant Floating Widget
   ========================================================================= */
export function FloatingAiAssistant({
  user,
  skills,
}: {
  user: User;
  skills: Skill[];
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: `Hi ${user.name.split(' ')[0]}! I'm your AchieveCell AI Career Coach. How can I help you reach readiness for ${user.targetRole?.name ?? 'your target role'} today?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');

  const quickPrompts = [
    'What skills should I learn next?',
    'How do I qualify for the Infosys Internship?',
    'Am I ready for Full Stack roles?',
  ];

  function sendQuery(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text, timestamp: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();
      if (lower.includes('internship') || lower.includes('infosys')) {
        reply = 'To qualify for the Infosys Full Stack Internship, you need at least 65% in React, SQL, and Node.js. Your SQL is verified at 82%, but taking the React assessment will unlock your direct application!';
      } else if (lower.includes('skill') || lower.includes('learn') || lower.includes('next')) {
        reply = 'Based on your gap analysis for Full Stack Developer, your top priorities are React and REST APIs. I recommend completing the React Component Sprint and taking the React Assessment.';
      } else if (lower.includes('ready') || lower.includes('readiness')) {
        reply = `Your overall role readiness for ${user.targetRole?.name ?? 'Full Stack'} is approximately 78%. Completing one corporate Skill Sprint will boost your profile into the top 15% of your cohort!`;
      } else {
        reply = `Great question! For your ${user.targetRole?.name ?? 'target role'}, building verifiable proof of work in college Skill Sprints and taking assessments will make you immediately visible to partner recruiters on AchieveCell.`;
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: reply, timestamp: 'Just now' },
      ]);
    }, 600);
  }

  return (
    <>
      <button
        className="primary-button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 999,
          borderRadius: '2rem',
          padding: '.8rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem',
          boxShadow: '0 8px 24px rgba(64, 89, 201, 0.35)',
        }}
      >
        <span>✦</span>
        <span>AI Career Coach</span>
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'fixed',
            bottom: '5.2rem',
            right: '2rem',
            width: 'min(92vw, 22rem)',
            height: '28rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            padding: '1rem',
            boxShadow: '0 16px 40px rgba(18, 30, 64, 0.25)',
            border: '1px solid #d4def7',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e7ecf8',
              paddingBottom: '.6rem',
              marginBottom: '.6rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '.9rem', color: '#25355e' }}>✦ AchieveCell AI Assistant</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3cb371' }} />
                <small style={{ fontSize: '.68rem', color: '#3cb371', fontWeight: 700 }}>Online & Tailored</small>
              </div>
            </div>
            <button className="text-button" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.6rem', padding: '.2rem 0' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '.65rem .85rem',
                  borderRadius: '.8rem',
                  background: m.sender === 'user' ? '#4059c9' : '#f0f4ff',
                  color: m.sender === 'user' ? '#fff' : '#223257',
                  fontSize: '.8rem',
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', margin: '.5rem 0' }}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                className="ghost-button"
                style={{ fontSize: '.68rem', padding: '.25rem .5rem', borderRadius: '.4rem' }}
                onClick={() => sendQuery(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery(input);
            }}
            style={{ display: 'flex', gap: '.4rem', marginTop: '.2rem' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for guidance..."
              style={{ padding: '.5rem .7rem', fontSize: '.8rem' }}
            />
            <button className="primary-button" style={{ padding: '.5rem .85rem', fontSize: '.8rem' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================================
   1. Shared Component: Student Profile View
   ========================================================================= */
export function StudentProfile({
  student,
  viewerRole,
  isShortlisted = false,
  onToggleShortlist,
  onClose,
}: {
  student: StudentProfileData;
  viewerRole: AccountType;
  isShortlisted?: boolean;
  onToggleShortlist?: (student: StudentProfileData) => void;
  onClose: () => void;
}): ReactElement {
  return (
    <div className="page">
      <button className="back-button" onClick={onClose}>
        ← Back to list
      </button>

      {/* Profile Hero Header */}
      <section className="hero-card">
        <div>
          <p className="eyebrow">{student.college} · {student.degree}</p>
          <h1>{student.name}</h1>
          <p>{student.bio}</p>

          <div className="hero-actions">
            {student.portfolioUrl && (
              <a href={student.portfolioUrl} target="_blank" rel="noreferrer" className="ghost-button">
                🌐 Portfolio
              </a>
            )}
            {student.githubUrl && (
              <a href={student.githubUrl} target="_blank" rel="noreferrer" className="ghost-button">
                🐙 GitHub
              </a>
            )}
            {student.linkedinUrl && (
              <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="ghost-button">
                💼 LinkedIn
              </a>
            )}
            {viewerRole === 'company' && onToggleShortlist && (
              <button
                className={isShortlisted ? 'secondary-button' : 'primary-button'}
                onClick={() => onToggleShortlist(student)}
              >
                {isShortlisted ? '✓ Shortlisted' : '+ Shortlist Candidate'}
              </button>
            )}
          </div>
        </div>

        <div className="role-orbit">
          <span>Target Career Fit</span>
          <strong>{student.targetRole}</strong>
          <small>{student.year} · Verified Readiness: {student.readiness}%</small>
          <ProgressBar value={student.readiness} tone="strong" />
        </div>
      </section>

      {/* Main Details Grid */}
      <div className="dashboard-grid">
        {/* Verified Skills Card */}
        <section className="card dashboard-skills">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Skill Breakdown</p>
              <h2>Verified Skill Profile</h2>
              <p>Scores verified through college Skill Sprints and assessments.</p>
            </div>
            <Badge tone="strong">{String(student.verifiedSkills.length)} Skills Verified</Badge>
          </div>

          <div className="skill-table">
            {student.verifiedSkills.map((item) => (
              <div className="skill-row" key={item.skill}>
                <div className="skill-meta">
                  <strong>{item.skill}</strong>
                  <small>{item.category}</small>
                </div>
                <div className="skill-progress">
                  <ProgressBar value={item.proficiency} tone={badgeTone(item.status)} />
                </div>
                <b>{item.proficiency}%</b>
                <Badge>{item.status}</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Completed Sprints & Proof of Work */}
        <section className="card gap-summary-card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Proof of Work</p>
              <h2>Completed Skill Sprints</h2>
            </div>
            <Badge tone="category">{String(student.completedSprints.length)} Completed</Badge>
          </div>
          <div className="summary-list">
            {student.completedSprints.map((sprint) => (
              <div className="summary-item" key={sprint}>
                <span className="summary-dot strong" />
                <span>{sprint}</span>
                <Badge tone="strong">Verified</Badge>
              </div>
            ))}
          </div>
          <p className="card-footnote">Projects and tasks evaluated under sprint partner guidelines.</p>
        </section>

        {/* Featured Projects Card */}
        <section className="card dashboard-skills" style={{ gridColumn: 'span 2' }}>
          <div className="card-heading">
            <div>
              <p className="section-kicker">Portfolio & Work</p>
              <h2>Featured Projects</h2>
              <p>Key applications built and evaluated during coursework and sprints.</p>
            </div>
          </div>

          <div className="role-grid">
            {student.projects.map((proj) => (
              <article key={proj.title} className="role-card">
                <div className="role-card-top">
                  <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                    {proj.techStack.map((tech) => (
                      <Badge key={tech} tone="category">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <h2>{proj.title}</h2>
                <p>{proj.description}</p>
                <span>Code Repository & Live Demo ↗</span>
              </article>
            ))}
          </div>
        </section>

        {/* Interests & Specializations */}
        <section className="card guidance-card" style={{ gridColumn: 'span 2' }}>
          <p className="section-kicker">Areas of Interest</p>
          <h2>Key Specializations</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', margin: '.6rem 0 1.2rem' }}>
            {student.interests.map((interest) => (
              <Badge key={interest} tone="category">
                {interest}
              </Badge>
            ))}
          </div>
          <p>
            Open for internship and placement opportunities related to <strong>{student.targetRole}</strong> and engineering leadership roles.
          </p>
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   2. Auth Page
   ========================================================================= */
export function AuthPage({
  mode,
  onAuthenticated,
}: {
  mode: 'login' | 'register';
  onAuthenticated: (token: string, user: User) => void;
}): ReactElement {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('student');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const body =
      mode === 'register'
        ? {
            name: form.get('name'),
            email: form.get('email'),
            password: form.get('password'),
            education: form.get('education'),
            year: form.get('year') ? Number(form.get('year')) : undefined,
            accountType,
          }
        : {
            email: form.get('email'),
            password: form.get('password'),
            accountType,
          };

    try {
      const result = await request<{ token: string; user: Omit<User, 'accountType'> }>(
        `/auth/${mode}`,
        undefined,
        { method: 'POST', body: JSON.stringify(body) },
      );
      onAuthenticated(result.token, withAccountType(result.user, accountType));
      navigate('/dashboard');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to continue.');
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';
  const namePlaceholder =
    accountType === 'college'
      ? 'e.g. AchieveCell Institute of Technology'
      : accountType === 'company'
        ? 'e.g. Infosys Talent Team'
        : 'e.g. Ananya Sharma';

  return (
    <main className="auth-shell">
      <section className="auth-showcase">
        <button className="brand" onClick={() => navigate('/login')}>
          <span>✦</span> AchieveCell
        </button>
        <div>
          <p className="eyebrow">Smart India Hackathon Prototype</p>
          <h1>Career clarity, verified skills, and talent matching.</h1>
          <p>Students prove skills through assessments, colleges launch focused sprints, and companies recruit verified talent.</p>
        </div>
        <div className="showcase-points">
          <span>✓ Real skill assessments & gap analyzer</span>
          <span>✓ College readiness tracking & skill sprints</span>
          <span>✓ Recruiter discovery & internship matching</span>
        </div>
      </section>

      <section className="auth-panel">
        <p className="eyebrow">{isLogin ? `${accountType} sign in` : `${accountType} registration`}</p>
        <h1>{isLogin ? 'Welcome back' : 'Start your profile'}</h1>
        <p className="muted">
          {isLogin
            ? 'Choose your workspace, then pick up where you left off.'
            : 'Select your account type and create a profile in under a minute.'}
        </p>

        <form onSubmit={submit} className="form-stack" noValidate>
          <div>
            <p className="section-kicker">Account type</p>
            <div className="options">
              {accountTypeOptions.map((option, optionIndex) => (
                <label key={option.id} className={`option ${accountType === option.id ? 'chosen' : ''}`}>
                  <input
                    type="radio"
                    name="accountType"
                    checked={accountType === option.id}
                    onChange={() => setAccountType(option.id)}
                  />
                  <span>{String.fromCharCode(65 + optionIndex)}</span>
                  {`${option.title} — ${option.detail}`}
                </label>
              ))}
            </div>
          </div>

          {!isLogin && (
            <>
              <label htmlFor="name">
                {accountType === 'student' ? 'Full name' : accountType === 'college' ? 'College name' : 'Company name'}
                <input id="name" name="name" required minLength={2} placeholder={namePlaceholder} />
              </label>
              {accountType === 'student' && (
                <>
                  <label htmlFor="education">
                    Education <span className="optional">Optional</span>
                    <input id="education" name="education" placeholder="e.g. B.Tech CSE" />
                  </label>
                  <label htmlFor="year">
                    Year <span className="optional">Optional</span>
                    <input id="year" name="year" type="number" min="1" max="8" placeholder="e.g. 2" />
                  </label>
                </>
              )}
            </>
          )}

          <label htmlFor="email">
            Email address
            <input id="email" name="email" type="email" required placeholder="you@example.com" />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              placeholder="At least 8 characters"
            />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="primary-button full-button" disabled={busy}>
            {busy ? 'Please wait…' : isLogin ? `Log in as ${accountType}` : `Create my ${accountType} account`}
          </button>
        </form>

        {isLogin && (
          <p className="demo-note">
            <strong>Want to explore?</strong> Use the demo account and select Student, College, or Company:
            <br />
            ananya.sharma@achievecell.demo
          </p>
        )}

        <p className="auth-switch">
          {isLogin ? 'New to AchieveCell?' : 'Already have an account?'}{' '}
          <button onClick={() => navigate(isLogin ? '/register' : '/login')}>
            {isLogin ? 'Create account' : 'Log in'}
          </button>
        </p>
      </section>
    </main>
  );
}

/* =========================================================================
   3. Student Dashboard
   ========================================================================= */
export function Dashboard({ token }: { token: string }): ReactElement {
  const [data, setData] = useState<DashboardData | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [guidance, setGuidance] = useState<AiGuidance | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      request<DashboardData>('/me/dashboard', token),
      request<Skill[]>('/me/skills', token),
      request<AiGuidance>('/me/ai-recommendation', token).catch(() => null),
    ])
      .then(([dashboard, skills, ai]) => {
        if (active) {
          setData(dashboard);
          setAllSkills(skills);
          setGuidance(ai);
        }
      })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Unable to load dashboard.'));
    return () => {
      active = false;
    };
  }, [token]);

  if (error) return <ErrorState message={error} action={<button className="secondary-button" onClick={() => window.location.reload()}>Try again</button>} />;
  if (!data) return <Loading />;

  const strongSkills = allSkills.filter((skill) => skill.proficiency >= 70).slice(0, 3);
  const completedAssessments = allSkills.filter((skill) => skill.source === 'assessment').length;
  const summary = data.skillGapSummary;

  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Your learning command center</p>
          <h1>Welcome back, {data.user.name.split(' ')[0]}.</h1>
          <p>Every assessment makes your recommendations more useful. Keep building the skills that support your goal.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('/assessments')}>
              Take a skill assessment
            </button>
            <button className="ghost-button" onClick={() => navigate('/roadmap')}>
              View AI Roadmap
            </button>
          </div>
        </div>
        <div className="role-orbit">
          <span>Target role</span>
          <strong>{data.targetRole?.name ?? 'Choose your direction'}</strong>
          <small>{data.targetRole?.category ?? 'Set a role to unlock your plan'}</small>
          <button onClick={() => navigate('/target-role')}>{data.targetRole ? 'Edit role' : 'Choose role'} →</button>
        </div>
      </section>

      <div className="metric-grid">
        <Metric label="Profile strength" value={data.profileStrength === null ? '—' : `${data.profileStrength}%`} detail="For your current target role" />
        <Metric label="Skills in profile" value={String(data.skillsAssessed)} detail="Skills currently being matched" accent="violet" />
        <Metric label="Assessments completed" value={String(completedAssessments)} detail="Verified by submitted answers" accent="green" />
        <Metric label="Recommended careers" value={String(data.recommendations.length)} detail="Calculated from your skills" accent="orange" />
      </div>

      <div className="dashboard-grid">
        <section className="card dashboard-skills">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Skill profile</p>
              <h2>Your strongest skills</h2>
              <p>Keep these strengths active while you build the next ones.</p>
            </div>
            <button className="text-button" onClick={() => navigate('/skills')}>
              View all skills
            </button>
          </div>
          {strongSkills.length ? (
            strongSkills.map((skill) => <SkillRow key={skill.skillId} skill={skill} />)
          ) : (
            <Empty
              title="Build your first strength"
              text="Complete an assessment to start tracking the skills you know best."
              action="Browse assessments"
              path="/assessments"
            />
          )}
        </section>

        <section className="card gap-summary-card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Target-role readiness</p>
              <h2>Skill gap summary</h2>
            </div>
            <button className="text-button" onClick={() => navigate('/skill-gap')}>
              Explore gaps
            </button>
          </div>
          {summary ? (
            <>
              <div className="summary-list">
                <SummaryItem label="Missing skills" value={summary.missingSkills} tone="missing" />
                <SummaryItem label="Skills to improve" value={summary.skillsToImprove} tone="needs-improvement" />
                <SummaryItem label="Strong skills" value={summary.strongSkills} tone="strong" />
              </div>
              <p className="card-footnote">Focus on High priority gaps first to improve your target-role match.</p>
            </>
          ) : (
            <Empty
              title="Choose a target role"
              text="Your personalised skill-gap plan appears after you select a career direction."
              action="Choose target role"
              path="/target-role"
            />
          )}
        </section>

        <section className="card recommendations-preview">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Your options</p>
              <h2>Career recommendations</h2>
              <p>Ranked by your real, recorded skill levels.</p>
            </div>
            <button className="text-button" onClick={() => navigate('/recommendations')}>
              See all
            </button>
          </div>
          <div className="recommendation-list">
            {data.recommendations.slice(0, 3).map((item, index) => (
              <RecommendationRow key={item.careerId} item={item} index={index} />
            ))}
          </div>
        </section>

        <section className="card guidance-card">
          <p className="section-kicker">Recommended next step</p>
          <h2>{guidance?.prioritySkills[0] ? `Focus on ${guidance.prioritySkills[0].skill}` : 'Take your next assessment'}</h2>
          <p>{guidance?.prioritySkills[0]?.reason ?? 'Assess a skill to make your career guidance more personal.'}</p>
          <button
            className="secondary-button"
            onClick={() => navigate(guidance?.prioritySkills[0] ? '/skill-gap' : '/assessments')}
          >
            {guidance?.prioritySkills[0] ? 'View skill gaps' : 'Start assessment'}
          </button>
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   4. Student AI Roadmap Page
   ========================================================================= */
export function AiRoadmapPage({
  user,
}: {
  user: User;
}): ReactElement {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(defaultRoadmapMilestones);
  const [message, setMessage] = useState('');

  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const progressRate = Math.round((completedCount / milestones.length) * 100);

  function toggleComplete(id: number) {
    const next = milestones.map((m) => {
      if (m.id === id) {
        const nextStatus: 'Completed' | 'In Progress' = m.status === 'Completed' ? 'In Progress' : 'Completed';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setMilestones(next);
    setMessage('Learning milestone status updated! Your roadmap readiness refreshed.');
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Personalized AI Learning Sequence</p>
          <h1>Target Role Roadmap: {user.targetRole?.name ?? 'Full Stack Developer'}</h1>
          <p className="muted">
            An adaptive milestone curriculum synthesized from your skill assessment scores and industry job requirements.
          </p>
        </div>
        <button className="primary-button" onClick={() => navigate('/assessments')}>
          Take Next Skill Assessment
        </button>
      </div>

      {message && <div className="success-message" role="status">✓ {message}</div>}

      <section className="target-role-banner">
        <div>
          <span>Overall Roadmap Progress</span>
          <h2>{progressRate}% Curriculum Completed</h2>
          <p>{completedCount} of {milestones.length} core milestones verified.</p>
        </div>
        <div style={{ minWidth: '12rem' }}>
          <ProgressBar value={progressRate} tone="strong" />
        </div>
      </section>

      <div style={{ display: 'grid', gap: '1.2rem', marginTop: '1rem' }}>
        {milestones.map((m, index) => (
          <article className="card" key={m.id} style={{ borderLeft: `4px solid ${m.status === 'Completed' ? '#49b87d' : m.status === 'In Progress' ? '#5870d5' : '#d0d7de'}` }}>
            <div className="card-heading">
              <div>
                <p className="section-kicker">{m.phase}</p>
                <h2 style={{ fontSize: '1.2rem' }}>{index + 1}. {m.title}</h2>
                <p>{m.description}</p>
              </div>
              <Badge tone={m.status === 'Completed' ? 'strong' : m.status === 'In Progress' ? 'building-confidence' : 'needs-improvement'}>
                {m.status}
              </Badge>
            </div>

            <div style={{ margin: '.8rem 0' }}>
              <p className="section-kicker" style={{ marginBottom: '.4rem' }}>Target Competencies</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '.8rem' }}>
                {m.skills.map((s) => (
                  <div key={s.name} style={{ background: '#f8fafd', padding: '.65rem .85rem', borderRadius: '.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                      <strong style={{ fontSize: '.84rem' }}>{s.name}</strong>
                      <small>{s.proficiency}% / {s.target}% Target</small>
                    </div>
                    <ProgressBar value={s.proficiency} tone={s.proficiency >= s.target ? 'strong' : 'needs-improvement'} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '.8rem' }}>
              <p className="section-kicker" style={{ marginBottom: '.4rem' }}>Recommended Interactive Resources</p>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                {m.resources.map((res) => (
                  <a
                    key={res.title}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-button"
                    style={{ fontSize: '.76rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
                  >
                    <span>↗</span> {res.title} ({res.type})
                  </a>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.6rem', marginTop: '1.2rem' }}>
              <button
                className={m.status === 'Completed' ? 'ghost-button' : 'secondary-button'}
                onClick={() => toggleComplete(m.id)}
              >
                {m.status === 'Completed' ? '✓ Completed (Click to Reset)' : 'Mark Phase Completed'}
              </button>
              <button className="primary-button" onClick={() => navigate('/assessments')}>
                Assess Focus Skills
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   5. Student Internship Corner (Functional Page)
   ========================================================================= */
export function StudentInternshipsPage({
  token,
  internships,
  appliedIds,
  onApply,
}: {
  token: string;
  internships: Internship[];
  appliedIds: number[];
  onApply: (internship: Internship) => void;
}): ReactElement {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    request<Skill[]>('/me/skills', token)
      .then(setSkills)
      .catch(() => setSkills(getLocalSkills()));
  }, [token]);

  function handleApply(item: Internship) {
    onApply(item);
    setMessage(`Your application for "${item.title}" at ${item.company} was submitted successfully!`);
  }

  const filtered = internships.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Opportunity Matching</p>
          <h1>Internship Corner</h1>
          <p className="muted">
            Explore industry internships. Companies evaluate candidates with verified skill proficiencies.
          </p>
        </div>
        <button className="secondary-button" onClick={() => navigate('/assessments')}>
          Boost Skills via Assessment
        </button>
      </div>

      {message && <div className="success-message" role="status">✓ {message}</div>}

      <label className="search-label" htmlFor="internship-search">
        Find internships by role, company, or required skill
        <input
          id="internship-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. Full Stack, React, SQL, Infosys…"
        />
      </label>

      <div className="assessment-grid">
        {filtered.map((item) => {
          const missingSkills = item.requiredSkills.filter((req) => {
            const match = skills.find((s) => s.skill.toLowerCase() === req.toLowerCase());
            return !match || match.proficiency < 60;
          });
          const isQualified = missingSkills.length === 0;
          const hasApplied = appliedIds.includes(item.id);

          return (
            <article className="card assessment-card" key={item.id}>
              <div className="assessment-card-top">
                <Badge tone="category">{item.company}</Badge>
                <span>{item.postedDate}</span>
              </div>

              <h2>{item.title}</h2>
              <p>{item.description}</p>

              <div style={{ margin: '.5rem 0' }}>
                <small>
                  <strong>Stipend:</strong> {item.stipend} · <strong>Duration:</strong> {item.duration}
                </small>
                <br />
                <small>
                  <strong>Location:</strong> {item.location}
                </small>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', margin: '.6rem 0 .9rem' }}>
                {item.requiredSkills.map((reqSkill) => {
                  const studentSkill = skills.find((s) => s.skill.toLowerCase() === reqSkill.toLowerCase());
                  const ok = studentSkill && studentSkill.proficiency >= 60;
                  return (
                    <Badge key={reqSkill} tone={ok ? 'strong' : 'needs-improvement'}>
                      {reqSkill} {ok ? `(${studentSkill.proficiency}%)` : '(Missing)'}
                    </Badge>
                  );
                })}
              </div>

              <div style={{ marginTop: 'auto', width: '100%' }}>
                {isQualified ? (
                  <button
                    className={hasApplied ? 'ghost-button' : 'primary-button'}
                    style={{ width: '100%' }}
                    disabled={hasApplied}
                    onClick={() => handleApply(item)}
                  >
                    {hasApplied ? '✓ Application Submitted' : 'Apply Now'}
                  </button>
                ) : (
                  <button
                    className="secondary-button"
                    style={{ width: '100%' }}
                    onClick={() => navigate('/assessments')}
                  >
                    Take Assessment to Qualify
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length && (
        <Empty
          title="No internships match your search"
          text="Try searching for a different skill or company name."
          action="Clear search"
          onAction={() => setSearch('')}
        />
      )}
    </div>
  );
}

/* =========================================================================
   6. Student Settings Page (With Light/Dark Mode Toggle)
   ========================================================================= */
export function StudentSettingsPage({
  user,
  onUserUpdated,
}: {
  user: User;
  onUserUpdated: (user: User) => void;
}): ReactElement {
  const [isDark, setIsDark] = useState(() => localStorage.getItem(themeStorageKey) === 'dark');
  const [message, setMessage] = useState('');

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem(themeStorageKey, next ? 'dark' : 'light');
    if (next) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    setMessage(`Switched to ${next ? 'Dark' : 'Light'} display mode.`);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated: User = {
      ...user,
      name: String(form.get('name') ?? user.name),
      education: String(form.get('education') ?? user.education),
      year: Number(form.get('year') ?? user.year),
      linkedinUrl: String(form.get('linkedin') ?? ''),
      githubUrl: String(form.get('github') ?? ''),
      portfolioUrl: String(form.get('portfolio') ?? ''),
      collegeName: String(form.get('college') ?? ''),
      studentId: String(form.get('studentId') ?? ''),
    };
    localStorage.setItem('achievecell-mock-user', JSON.stringify(updated));
    onUserUpdated(updated);
    setMessage('Your student profile and link credentials were saved successfully!');
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Account & Preference Management</p>
          <h1>Profile & Settings</h1>
          <p className="muted">Manage your student credentials, connected accounts, and workspace appearance.</p>
        </div>
      </div>

      {message && <div className="success-message" role="status">✓ {message}</div>}

      <div className="dashboard-grid">
        <section className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-heading">
            <div>
              <p className="section-kicker">Display Appearance</p>
              <h2>Workspace Theme</h2>
              <p>Toggle between Light and Dark mode for high-contrast viewing.</p>
            </div>
            <button className="secondary-button" onClick={toggleTheme}>
              {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
            </button>
          </div>
        </section>

        <section className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-heading">
            <div>
              <p className="section-kicker">Personal & Academic Details</p>
              <h2>Edit Profile</h2>
            </div>
          </div>

          <form className="form-stack" onSubmit={handleSave}>
            <label htmlFor="student-name">
              Full Name
              <input id="student-name" name="name" defaultValue={user.name} required />
            </label>

            <div className="options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label htmlFor="student-edu">
                Degree / Specialization
                <input id="student-edu" name="education" defaultValue={user.education ?? 'B.Tech CSE'} />
              </label>
              <label htmlFor="student-year">
                Graduation Cohort Year
                <input id="student-year" name="year" type="number" min="1" max="8" defaultValue={user.year ?? 2} />
              </label>
            </div>

            <div className="options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label htmlFor="student-college">
                Enrolled College / University
                <input id="student-college" name="college" defaultValue={user.collegeName ?? 'AchieveCell Institute of Technology'} />
              </label>
              <label htmlFor="student-id">
                Roll Number / Student ID
                <input id="student-id" name="studentId" defaultValue={user.studentId ?? 'ACIT-2024-CSE-042'} />
              </label>
            </div>

            <p className="section-kicker" style={{ marginTop: '1rem' }}>Connected Accounts & Portfolios</p>

            <label htmlFor="student-linkedin">
              LinkedIn Profile URL
              <input id="student-linkedin" name="linkedin" defaultValue={user.linkedinUrl ?? 'https://linkedin.com/in/ananya-sharma'} placeholder="https://linkedin.com/in/..." />
            </label>

            <label htmlFor="student-github">
              GitHub Profile URL
              <input id="student-github" name="github" defaultValue={user.githubUrl ?? 'https://github.com/ananya-dev'} placeholder="https://github.com/..." />
            </label>

            <label htmlFor="student-portfolio">
              Personal Portfolio Website URL
              <input id="student-portfolio" name="portfolio" defaultValue={user.portfolioUrl ?? 'https://ananya-portfolio.dev'} placeholder="https://..." />
            </label>

            <button className="primary-button" type="submit" style={{ marginTop: '.8rem' }}>
              Save Profile Changes
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   7. College Dashboard (Finalized with Working Recommendations & Submitters UI)
   ========================================================================= */
export function CollegeDashboard({
  user,
  focus,
  sprints,
  onLaunchSprint,
  onUserUpdated,
}: {
  user: User;
  focus?: 'overview' | 'sprints' | 'readiness' | 'students' | 'settings';
  sprints: SkillSprint[];
  onLaunchSprint: (sprint: SkillSprint) => void;
  onUserUpdated: (user: User) => void;
}): ReactElement {
  const [selectedSprint, setSelectedSprint] = useState<SkillSprint | null>(sprints[0] ?? null);
  const [viewingStudent, setViewingStudent] = useState<StudentProfileData | null>(null);
  const [launching, setLaunching] = useState(false);
  const [sprintSkillPrefill, setSprintSkillPrefill] = useState('');
  const [sprintTitlePrefill, setSprintTitlePrefill] = useState('');
  const [sprintCompanyPrefill, setSprintCompanyPrefill] = useState('');
  const [message, setMessage] = useState('');

  const studentsWithDemand = mockStudentsDirectory.filter((student) => student.readiness >= 70).length;
  const inDemandShare = Math.round((studentsWithDemand / mockStudentsDirectory.length) * 100);

  function handleLaunchSprint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const skill = String(form.get('skill') ?? '').trim();
    const company = String(form.get('company') ?? '').trim();
    const duration = String(form.get('duration') ?? '7 days').trim();

    if (!title || !skill) return;

    const next: SkillSprint = {
      id: Date.now(),
      title,
      skill,
      company: company || 'College-led',
      duration,
      enrolled: 45,
      submitted: 0,
      status: 'Active',
    };
    onLaunchSprint(next);
    setLaunching(false);
    setSelectedSprint(next);
    setMessage(`${title} is now active! Enrolled 45 students and sent real-time notifications.`);
  }

  function triggerActionSprint(action: RecommendedAction) {
    const nextSprint: SkillSprint = {
      id: Date.now(),
      title: action.suggestedSprint,
      skill: action.skill,
      company: action.company,
      duration: '7 days',
      enrolled: 45,
      submitted: 0,
      status: 'Active',
    };
    onLaunchSprint(nextSprint);
    setSelectedSprint(nextSprint);
    setMessage(`Successfully launched "${action.suggestedSprint}"! Real-time notification dispatched to all students.`);
  }

  if (viewingStudent) {
    return (
      <StudentProfile
        student={viewingStudent}
        viewerRole="college"
        onClose={() => setViewingStudent(null)}
      />
    );
  }

  if (focus === 'settings') {
    return (
      <div className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Institutional Administration</p>
            <h1>College Profile & Settings</h1>
            <p className="muted">Configure campus placement details, accreditation info, and coordinator contacts.</p>
          </div>
        </div>

        {message && <div className="success-message" role="status">✓ {message}</div>}

        <section className="card">
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage('College institutional profile updated successfully.');
            }}
          >
            <label htmlFor="college-inst-name">
              Institution Name
              <input id="college-inst-name" defaultValue={user.name} />
            </label>
            <div className="options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label htmlFor="college-code">
                AISHE / College Code
                <input id="college-code" defaultValue="C-10482-ACIT" />
              </label>
              <label htmlFor="college-naac">
                Accreditation Rating
                <input id="college-naac" defaultValue="NAAC A++ Grade · NBA Tier-1" />
              </label>
            </div>
            <div className="options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label htmlFor="college-officer">
                Dean of Placements / Officer
                <input id="college-officer" defaultValue="Dr. S. K. Ramanathan" />
              </label>
              <label htmlFor="college-email">
                Placement Cell Contact Email
                <input id="college-email" defaultValue="placements@achievecell.demo" />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Save Institutional Settings
            </button>
          </form>
        </section>
      </div>
    );
  }

  const showOverview = !focus || focus === 'overview';
  const showSprints = showOverview || focus === 'sprints';
  const showReadiness = showOverview || focus === 'readiness';
  const showStudents = showOverview || focus === 'students';

  return (
    <div className="page">
      {showOverview && (
        <>
          <section className="hero-card">
            <div>
              <p className="eyebrow">College Institutional Workspace</p>
              <h1>Welcome, {user.name.split(' ')[0]}.</h1>
              <p>
                Analyze cohort role readiness, review AI-recommended placement actions, launch corporate Skill Sprints, and inspect verified student profiles.
              </p>
              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => {
                    setSprintTitlePrefill('');
                    setSprintSkillPrefill('');
                    setSprintCompanyPrefill('');
                    setLaunching(true);
                  }}
                >
                  Launch New Sprint
                </button>
                <button className="ghost-button" onClick={() => navigate('/students')}>
                  Open student directory
                </button>
              </div>
            </div>
            <div className="role-orbit">
              <span>Campus Focus</span>
              <strong>Placement Readiness</strong>
              <small>SQL & React are top hiring requirements this week</small>
              <button onClick={() => navigate('/sprints')}>Review active sprints →</button>
            </div>
          </section>

          <div className="metric-grid">
            <Metric label="Total Enrolled Students" value="248" detail="Across current cohorts" />
            <Metric label="Top In-Demand Skill" value="SQL" detail="Required by 4 partner companies" accent="violet" />
            <Metric label="% Students with In-Demand Skills" value={`${inDemandShare}%`} detail={`${studentsWithDemand} of ${mockStudentsDirectory.length} sampled students`} accent="green" />
            <Metric label="% Students Lacking Skills" value={`${100 - inDemandShare}%`} detail="Need a focused Skill Sprint" accent="orange" />
          </div>
        </>
      )}

      {message && <div className="success-message" role="status">✓ {message}</div>}

      {/* Recommended Actions Section */}
      {showOverview && (
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">AI Recommendation Engine</p>
              <h2>Recommended Institutional Actions</h2>
              <p>Automated analysis of student skill gaps and corporate demand patterns.</p>
            </div>
            <Badge tone="high">3 Actions Suggested</Badge>
          </div>

          <div className="skill-table">
            {defaultRecommendedActions.map((action) => (
              <article className="skill-card" key={action.id}>
                <div>
                  <Badge tone={action.urgency === 'high' ? 'missing' : 'building-confidence'}>
                    {action.urgency === 'high' ? 'High Priority' : 'Recommended'}
                  </Badge>
                  <h2>{action.title}</h2>
                  <p>{action.reason}</p>
                </div>
                <strong>{action.skill}</strong>
                <Badge tone="category">{action.company}</Badge>
                <button className="primary-button" onClick={() => triggerActionSprint(action)}>
                  Launch {action.skill} Sprint
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Role Readiness Section with Clear Ready vs Needs Preparation Breakdown */}
      {showReadiness && (
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Cohort Analytics & Student Matching</p>
              <h2>Student Body Role Readiness</h2>
              <p>Categorized list of students benchmarked for key industry target roles.</p>
            </div>
          </div>

          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {defaultRoleReadiness.map((roleItem) => (
              <section className={`metric-card ${roleItem.accent}`} key={roleItem.role}>
                <p>{roleItem.role}</p>
                <strong>{roleItem.readinessRate}% Ready</strong>
                <ProgressBar value={roleItem.readinessRate} tone="strong" />
                <small style={{ marginTop: '.6rem', display: 'block' }}>
                  {roleItem.readyStudents} of {roleItem.totalStudents} students benchmarked · Focus: {roleItem.topSkill}
                </small>
              </section>
            ))}
          </div>

          {/* Detailed Lists: Ready vs Needs Preparation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.2rem', marginTop: '1.4rem' }}>
            {/* Ready Students List */}
            <div style={{ border: '1px solid #c9edd8', background: '#f6fbf8', borderRadius: '.8rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
                <strong style={{ color: '#176943' }}>✓ Ready for Placement (Match ≥ 70%)</strong>
                <Badge tone="strong">{String(mockStudentsDirectory.filter((s) => s.readiness >= 70).length)} Ready</Badge>
              </div>
              <div className="skill-table">
                {mockStudentsDirectory
                  .filter((s) => s.readiness >= 70)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="skill-row"
                      style={{ background: '#fff', cursor: 'pointer' }}
                      onClick={() => setViewingStudent(student)}
                    >
                      <div className="skill-meta">
                        <strong>{student.name}</strong>
                        <small>{student.targetRole}</small>
                      </div>
                      <div className="skill-progress">
                        <ProgressBar value={student.readiness} tone="strong" />
                      </div>
                      <b>{student.readiness}%</b>
                      <Badge tone="strong">Ready</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Needs Preparation Students List */}
            <div style={{ border: '1px solid #fed7aa', background: '#fffbf5', borderRadius: '.8rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
                <strong style={{ color: '#9a3412' }}>! Needs Preparation (Match &lt; 70%)</strong>
                <Badge tone="needs-improvement">{String(mockStudentsDirectory.filter((s) => s.readiness < 70).length)} In Training</Badge>
              </div>
              <div className="skill-table">
                {mockStudentsDirectory
                  .filter((s) => s.readiness < 70)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="skill-row"
                      style={{ background: '#fff', cursor: 'pointer' }}
                      onClick={() => setViewingStudent(student)}
                    >
                      <div className="skill-meta">
                        <strong>{student.name}</strong>
                        <small>{student.targetRole} · Needs SQL / React</small>
                      </div>
                      <div className="skill-progress">
                        <ProgressBar value={student.readiness} tone="needs-improvement" />
                      </div>
                      <b>{student.readiness}%</b>
                      <button
                        className="secondary-button"
                        style={{ padding: '.25rem .5rem', fontSize: '.72rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingStudent(student);
                        }}
                      >
                        Profile →
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Skill Sprints Section with Submitted vs Pending Breakdown */}
      {showSprints && (
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Standout Feature</p>
              <h2>Active Skill Sprints</h2>
              <p>Short, focused improvement activities requested by companies — such as a 7-Day SQL Task.</p>
            </div>
            <button className="primary-button" onClick={() => setLaunching((open) => !open)}>
              {launching ? 'Close form' : 'Launch New Sprint'}
            </button>
          </div>

          {launching && (
            <form className="form-stack" onSubmit={handleLaunchSprint}>
              <label htmlFor="sprint-title">
                Sprint title
                <input
                  id="sprint-title"
                  name="title"
                  required
                  defaultValue={sprintTitlePrefill}
                  placeholder="e.g. 7-Day SQL Task"
                />
              </label>
              <label htmlFor="sprint-skill">
                Focus skill
                <input
                  id="sprint-skill"
                  name="skill"
                  required
                  defaultValue={sprintSkillPrefill}
                  placeholder="e.g. SQL"
                />
              </label>
              <label htmlFor="sprint-company">
                Requested by company <span className="optional">Optional</span>
                <input
                  id="sprint-company"
                  name="company"
                  defaultValue={sprintCompanyPrefill}
                  placeholder="e.g. Infosys"
                />
              </label>
              <label htmlFor="sprint-duration">
                Duration
                <input id="sprint-duration" name="duration" defaultValue="7 days" />
              </label>
              <button className="primary-button" type="submit">
                Launch sprint & notify cohort
              </button>
            </form>
          )}

          <div className="assessment-grid">
            {sprints.map((sprint) => (
              <article className="card assessment-card" key={sprint.id}>
                <div className="assessment-card-top">
                  <Badge tone="category">{sprint.skill}</Badge>
                  <Badge>{sprint.status}</Badge>
                </div>
                <h2>{sprint.title}</h2>
                <p>Requested by {sprint.company} · {sprint.duration}</p>
                <small>{sprint.submitted} of {sprint.enrolled} students submitted proof</small>
                <ProgressBar
                  value={sprint.enrolled ? Math.round((sprint.submitted / sprint.enrolled) * 100) : 0}
                  tone="strong"
                />
                <button
                  className={selectedSprint?.id === sprint.id ? 'secondary-button' : 'primary-button'}
                  onClick={() => setSelectedSprint(sprint)}
                >
                  {selectedSprint?.id === sprint.id ? 'Viewing Submitters' : 'Inspect Submitters'}
                </button>
              </article>
            ))}
          </div>

          {/* Selected Sprint Detailed Submitters UI */}
          {selectedSprint && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e7ebf4', paddingTop: '1.2rem' }}>
              <div className="card-heading">
                <div>
                  <p className="section-kicker">{selectedSprint.company} Partner Verification</p>
                  <h2>Submitter Details: {selectedSprint.title}</h2>
                  <p>Review verified proof of work and follow up with pending cohort members.</p>
                </div>
                <Badge tone="category">{selectedSprint.skill}</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.2rem' }}>
                {/* Submitted / Verified List */}
                <div>
                  <h3 style={{ fontSize: '.92rem', color: '#176943', marginBottom: '.6rem' }}>
                    ✓ Submitted & Verified ({mockStudentsDirectory.filter((s) => s.completedSprints.includes(selectedSprint.title)).length})
                  </h3>
                  <div className="skill-table">
                    {mockStudentsDirectory
                      .filter((s) => s.completedSprints.includes(selectedSprint.title))
                      .map((student) => (
                        <div
                          key={student.id}
                          className="skill-row"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setViewingStudent(student)}
                        >
                          <div className="skill-meta">
                            <strong>{student.name}</strong>
                            <small>{student.degree}</small>
                          </div>
                          <Badge tone="strong">Verified Proof</Badge>
                          <button
                            className="text-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingStudent(student);
                            }}
                          >
                            View →
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Pending / In Progress List */}
                <div>
                  <h3 style={{ fontSize: '.92rem', color: '#854d0e', marginBottom: '.6rem' }}>
                    ⏳ Pending / In Progress ({mockStudentsDirectory.filter((s) => !s.completedSprints.includes(selectedSprint.title)).length})
                  </h3>
                  <div className="skill-table">
                    {mockStudentsDirectory
                      .filter((s) => !s.completedSprints.includes(selectedSprint.title))
                      .map((student) => (
                        <div key={student.id} className="skill-row">
                          <div className="skill-meta">
                            <strong>{student.name}</strong>
                            <small>{student.year} · In Progress</small>
                          </div>
                          <Badge tone="needs-improvement">Pending Proof</Badge>
                          <button
                            className="secondary-button"
                            style={{ padding: '.25rem .5rem', fontSize: '.72rem' }}
                            onClick={() => setMessage(`Automated reminder notification sent to ${student.name}.`)}
                          >
                            Remind
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Student Directory Section */}
      {showStudents && (
        <section className="card skill-table">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Campus Cohort</p>
              <h2>Student Directory</h2>
              <p>Click any student to view their detailed Portfolio, Projects, Interests, and Verified Skills.</p>
            </div>
            <Badge tone="category">{String(mockStudentsDirectory.length)} Students</Badge>
          </div>

          {mockStudentsDirectory.map((student) => (
            <div
              className="skill-row"
              key={student.id}
              style={{ cursor: 'pointer' }}
              onClick={() => setViewingStudent(student)}
            >
              <div className="skill-meta">
                <strong>{student.name}</strong>
                <small>{student.degree} · {student.year}</small>
              </div>
              <div className="skill-progress">
                <ProgressBar value={student.readiness} tone={badgeTone(skillLabel(student.readiness))} />
              </div>
              <b>{student.readiness}%</b>
              <button
                className="secondary-button"
                style={{ padding: '.35rem .7rem', fontSize: '.75rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingStudent(student);
                }}
              >
                View Profile →
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/* =========================================================================
   8. Company Dashboard (Finalized with Post Internships & Recruiter Settings)
   ========================================================================= */
export function CompanyDashboard({
  user,
  focus,
  internships,
  shortlistedIds,
  onPostInternship,
  onToggleShortlist,
  onUserUpdated,
}: {
  user: User;
  focus?: 'overview' | 'discovery' | 'shortlist' | 'internships' | 'settings';
  internships: Internship[];
  shortlistedIds: number[];
  onPostInternship: (internship: Internship) => void;
  onToggleShortlist: (student: StudentProfileData) => void;
  onUserUpdated: (user: User) => void;
}): ReactElement {
  const [viewingStudent, setViewingStudent] = useState<StudentProfileData | null>(null);
  const [search, setSearch] = useState('');
  const [postingInternship, setPostingInternship] = useState(false);
  const [message, setMessage] = useState('');

  function handlePostInternship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const skillsRaw = String(form.get('skills') ?? '').trim();
    const stipend = String(form.get('stipend') ?? '₹25,000 / month').trim();
    const duration = String(form.get('duration') ?? '6 Months').trim();
    const location = String(form.get('location') ?? 'Hybrid / Remote').trim();
    const description = String(form.get('description') ?? '').trim();

    if (!title || !skillsRaw) return;

    const newInternship: Internship = {
      id: Date.now(),
      title,
      company: user.name || 'Infosys',
      location,
      type: 'Internship',
      stipend,
      duration,
      requiredSkills: skillsRaw.split(',').map((s) => s.trim()).filter(Boolean),
      minProficiency: 65,
      description: description || 'Exciting engineering internship role at our innovation hub.',
      postedDate: 'Just now',
      applicantsCount: 0,
    };

    onPostInternship(newInternship);
    setPostingInternship(false);
    setMessage(`"${title}" was posted successfully and real-time alerts were dispatched to eligible students!`);
  }

  if (viewingStudent) {
    return (
      <StudentProfile
        student={viewingStudent}
        viewerRole="company"
        isShortlisted={shortlistedIds.includes(viewingStudent.id)}
        onToggleShortlist={onToggleShortlist}
        onClose={() => setViewingStudent(null)}
      />
    );
  }

  if (focus === 'settings') {
    return (
      <div className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Talent Acquisition Settings</p>
            <h1>Company Profile & Hiring Preferences</h1>
            <p className="muted">Manage your corporate recruitment brand, preferred hiring requirements, and recruiter contacts.</p>
          </div>
        </div>

        {message && <div className="success-message" role="status">✓ {message}</div>}

        <section className="card">
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage('Recruiter company profile and hiring preferences saved successfully.');
            }}
          >
            <label htmlFor="comp-name">
              Company Name
              <input id="comp-name" defaultValue={user.name} />
            </label>
            <div className="options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label htmlFor="comp-domain">
                Industry / Domain
                <input id="comp-domain" defaultValue="Information Technology & Enterprise Services" />
              </label>
              <label htmlFor="comp-hq">
                Headquarters
                <input id="comp-hq" defaultValue="Bangalore, Karnataka, India" />
              </label>
            </div>
            <div className="options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <label htmlFor="comp-recruiter">
                Recruiter Name & Title
                <input id="comp-recruiter" defaultValue="Rohan Verma · Lead Campus Recruiter" />
              </label>
              <label htmlFor="comp-email">
                Contact Email
                <input id="comp-email" defaultValue={user.email} />
              </label>
            </div>
            <label htmlFor="comp-prefs">
              Target Focus Skills for Upcoming Roles
              <input id="comp-prefs" defaultValue="React, SQL, Node.js, Python, Git" />
            </label>
            <button className="primary-button" type="submit">
              Save Company Settings
            </button>
          </form>
        </section>
      </div>
    );
  }

  const showOverview = !focus || focus === 'overview';
  const showDiscovery = showOverview || focus === 'discovery';
  const showShortlist = focus === 'shortlist';
  const showInternships = focus === 'internships';

  const shortlistedStudents = mockStudentsDirectory.filter((s) => shortlistedIds.includes(s.id));
  const discoveryStudents = mockStudentsDirectory.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.targetRole.toLowerCase().includes(search.toLowerCase()) ||
      s.verifiedSkills.some((sk) => sk.skill.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="page">
      {showOverview && (
        <>
          <section className="hero-card">
            <div>
              <p className="eyebrow">Recruiter Talent Workspace</p>
              <h1>Welcome, {user.name.split(' ')[0]}.</h1>
              <p>
                Discover college talent with verified proof of work, post internship opportunities, and shortlist candidates backed by Skill Sprint submissions.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => navigate('/discovery')}>
                  Discover sprint talent
                </button>
                <button className="ghost-button" onClick={() => setPostingInternship(true)}>
                  + Post New Internship
                </button>
              </div>
            </div>
            <div className="role-orbit">
              <span>Hiring Focus</span>
              <strong>Sprint Verified Talent</strong>
              <small>{shortlistedIds.length} candidate(s) shortlisted</small>
              <button onClick={() => navigate('/shortlist')}>Open Shortlist ({shortlistedIds.length}) →</button>
            </div>
          </section>

          <div className="metric-grid">
            <Metric label="Active job postings" value={String(internships.length)} detail="Across tech & data roles" />
            <Metric label="Total applicants" value={String(internships.reduce((acc, i) => acc + i.applicantsCount, 0))} detail="Across open postings" accent="violet" />
            <Metric label="Skill Sprint Matches" value={String(mockStudentsDirectory.length)} detail="College-verified proof of skill" accent="green" />
            <Metric label="Shortlisted Candidates" value={String(shortlistedIds.length)} detail="Saved from sprint matches" accent="orange" />
          </div>
        </>
      )}

      {message && <div className="success-message" role="status">✓ {message}</div>}

      {/* Post Internships Form */}
      {(postingInternship || showInternships) && (
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Recruitment Pipeline</p>
              <h2>Post a New Internship Opportunity</h2>
              <p>Students with matching verified skills will be eligible to apply.</p>
            </div>
            {postingInternship && (
              <button className="secondary-button" onClick={() => setPostingInternship(false)}>
                Close form
              </button>
            )}
          </div>

          <form className="form-stack" onSubmit={handlePostInternship}>
            <label htmlFor="internship-title">
              Internship Title
              <input id="internship-title" name="title" required placeholder="e.g. Full Stack Developer Intern" />
            </label>
            <label htmlFor="internship-skills">
              Required Skills (comma-separated)
              <input id="internship-skills" name="skills" required placeholder="e.g. React, Node.js, SQL, Git" />
            </label>
            <div className="options" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <label htmlFor="internship-stipend">
                Stipend
                <input id="internship-stipend" name="stipend" defaultValue="₹25,000 / month" />
              </label>
              <label htmlFor="internship-duration">
                Duration
                <input id="internship-duration" name="duration" defaultValue="6 Months" />
              </label>
              <label htmlFor="internship-location">
                Location
                <input id="internship-location" name="location" defaultValue="Bangalore · Hybrid" />
              </label>
            </div>
            <label htmlFor="internship-desc">
              Role Description
              <input id="internship-desc" name="description" placeholder="Brief summary of tasks and deliverables..." />
            </label>
            <button className="primary-button" type="submit">
              Post Internship to Student Corner
            </button>
          </form>
        </section>
      )}

      {/* Shortlisted Candidates Tab */}
      {showShortlist && (
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Saved Talent</p>
              <h2>Shortlisted Candidates ({shortlistedStudents.length})</h2>
              <p>Students you have shortlisted from college Skill Sprints.</p>
            </div>
          </div>

          {shortlistedStudents.length ? (
            <div className="skill-table">
              {shortlistedStudents.map((candidate) => (
                <article className="skill-card" key={candidate.id}>
                  <div>
                    <Badge tone="strong">✓ Shortlisted</Badge>
                    <h2>{candidate.name}</h2>
                    <p>{candidate.college} · {candidate.degree}</p>
                    <small>Completed: {candidate.completedSprints.join(', ')}</small>
                  </div>
                  <strong>{candidate.readiness}%</strong>
                  <ProgressBar value={candidate.readiness} tone="strong" />
                  <button className="primary-button" onClick={() => setViewingStudent(candidate)}>
                    View Full Profile
                  </button>
                  <button className="ghost-button" onClick={() => onToggleShortlist(candidate)}>
                    Remove
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title="No candidates shortlisted yet"
              text="Explore talent verified through college sprints and click 'Shortlist' to save them here."
              action="Browse Talent Discovery"
              onAction={() => navigate('/discovery')}
            />
          )}
        </section>
      )}

      {/* Talent Discovery Section */}
      {showDiscovery && !showShortlist && (
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Verified Talent</p>
              <h2>Candidate Discovery</h2>
              <p>Review students who completed corporate-requested Skill Sprints.</p>
            </div>
          </div>

          <label className="search-label" htmlFor="discovery-search">
            Search candidates by name, target role, or skill
            <input
              id="discovery-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. SQL, React, Full Stack, Ananya…"
            />
          </label>

          <div className="skill-table">
            {discoveryStudents.map((student) => {
              const isShortlisted = shortlistedIds.includes(student.id);
              return (
                <article className="skill-card" key={student.id}>
                  <div>
                    <Badge tone="category">{student.targetRole}</Badge>
                    <h2>{student.name}</h2>
                    <p>{student.college} · completed {student.completedSprints.join(', ')}</p>
                  </div>
                  <strong>{student.readiness}%</strong>
                  <ProgressBar value={student.readiness} tone={badgeTone(skillLabel(student.readiness))} />
                  <Badge>{isShortlisted ? 'Shortlisted' : 'Sprint verified'}</Badge>
                  <button className="secondary-button" onClick={() => setViewingStudent(student)}>
                    View Profile
                  </button>
                  <button
                    className={isShortlisted ? 'ghost-button' : 'primary-button'}
                    onClick={() => onToggleShortlist(student)}
                  >
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* =========================================================================
   9. Recommendations, Skills, Target Role, Skill Gap, Assessments
   ========================================================================= */
export function RecommendationsPage({ token }: { token: string }): ReactElement {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request<DashboardData>('/me/dashboard', token)
      .then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load recommendations.'));
  }, [token]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading message="Ranking your career options…" />;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your career possibilities</p>
          <h1>Career recommendations</h1>
          <p className="muted">These rankings use your current proficiencies and each role’s required levels and importance.</p>
        </div>
        <button className="secondary-button" onClick={() => navigate('/assessments')}>
          Improve with an assessment
        </button>
      </div>

      <section className="recommendations-board">
        {data.recommendations.map((item, index) => (
          <article key={item.careerId} className="recommendation-card">
            <div className="recommendation-card-top">
              <span className="rank">0{index + 1}</span>
              <Badge tone="category">{item.category}</Badge>
            </div>
            <h2>{item.career}</h2>
            <strong>
              {item.matchScore}% <small>match</small>
            </strong>
            <ProgressBar value={item.matchScore} />
            <p>Your match updates automatically after every completed assessment.</p>
            <button className="secondary-button" onClick={() => navigate(`/skill-gap?career=${item.careerId}`)}>
              Understand this match
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export function SkillsPage({ token }: { token: string }): ReactElement {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request<Skill[]>('/me/skills', token)
      .then(setSkills)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load skills.'));
  }, [token]);

  if (error) return <ErrorState message={error} />;
  if (!skills) return <Loading message="Loading your skills…" />;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your skill profile</p>
          <h1>Skills you’re building</h1>
          <p className="muted">Proficiency changes only when you submit a skill assessment.</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/assessments')}>
          Take an assessment
        </button>
      </div>

      <section className="card skill-table">
        {skills.length ? (
          skills.map((skill) => (
            <article className="skill-card" key={skill.skillId}>
              <div>
                <Badge tone="category">{skill.category}</Badge>
                <h2>{skill.skill}</h2>
                <p>{skill.lastAssessed ? `Assessed ${new Date(skill.lastAssessed).toLocaleDateString()}` : 'Add confidence with an assessment'}</p>
              </div>
              <strong>{skill.proficiency}%</strong>
              <ProgressBar value={skill.proficiency} tone={badgeTone(skillLabel(skill.proficiency))} />
              <Badge>{skillLabel(skill.proficiency)}</Badge>
              <button className="secondary-button" onClick={() => navigate('/assessments')}>
                Assess skill
              </button>
            </article>
          ))
        ) : (
          <Empty
            title="Your profile is ready to grow"
            text="Start an assessment to add your first verified skill."
            action="Browse assessments"
            path="/assessments"
          />
        )}
      </section>
    </div>
  );
}

export function TargetRolePage({
  token,
  user,
  onUserUpdated,
}: {
  token: string;
  user: User;
  onUserUpdated: (user: User) => void;
}): ReactElement {
  const [careers, setCareers] = useState<Career[] | null>(null);
  const [selected, setSelected] = useState<number | null>(user.targetRole?.id ?? null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    request<Career[]>('/careers')
      .then(setCareers)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load roles.'));
  }, []);

  useEffect(() => setSelected(user.targetRole?.id ?? null), [user.targetRole?.id]);

  const choices = useMemo(
    () =>
      (careers ?? []).filter(
        (career) =>
          career.name.toLowerCase().includes(search.toLowerCase()) ||
          career.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [careers, search],
  );

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await request<Pick<User, 'id' | 'name' | 'targetRole'>>('/me/target-role', token, {
        method: 'PATCH',
        body: JSON.stringify({ targetRoleId: selected }),
      });
      onUserUpdated({ ...user, targetRole: updated.targetRole });
      setMessage(
        `${updated.targetRole?.name ?? 'Your target role'} is now your active target. Your dashboard and skill gaps will refresh from this choice.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save role.');
    } finally {
      setSaving(false);
    }
  }

  if (error && !careers) return <ErrorState message={error} />;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Choose your direction</p>
          <h1>Target career role</h1>
          <p className="muted">AchieveCell uses this role to calculate profile strength and explain your most important skill gaps.</p>
        </div>
        <button className="primary-button" disabled={!selected || saving} onClick={save}>
          {saving ? 'Saving role…' : 'Save target role'}
        </button>
      </div>

      {message && <div className="success-message" role="status">✓ {message}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="target-role-banner">
        <div>
          <span>Current target</span>
          <h2>{user.targetRole?.name ?? 'No target role selected'}</h2>
          <p>{user.targetRole?.category ?? 'Choose a role below to personalise your dashboard.'}</p>
        </div>
        <button className="ghost-button" onClick={() => navigate('/skill-gap')}>
          View current skill gaps
        </button>
      </section>

      <label className="search-label" htmlFor="career-search">
        Find a career role
        <input
          id="career-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search software, data, cloud…"
        />
      </label>

      {careers ? (
        <div className="role-grid">
          {choices.map((career) => (
            <button
              key={career.id}
              className={`role-card ${selected === career.id ? 'selected' : ''}`}
              onClick={() => setSelected(career.id)}
            >
              <div className="role-card-top">
                <Badge tone="category">{career.category}</Badge>
                {selected === career.id && <Badge tone="selected">Selected</Badge>}
              </div>
              <h2>{career.name}</h2>
              <p>{career.description}</p>
              <span>{selected === career.id ? 'Ready to save' : 'Choose this role'} →</span>
            </button>
          ))}
        </div>
      ) : (
        <Loading message="Loading available careers…" />
      )}

      {careers && !choices.length && (
        <Empty
          title="No roles found"
          text="Try a broader search such as software, data, or cloud."
          action="Clear search"
          path="/target-role"
        />
      )}
    </div>
  );
}

export function SkillGapPage({
  token,
  user,
  initialCareerId,
}: {
  token: string;
  user: User;
  initialCareerId: string | null;
}): ReactElement {
  const [careers, setCareers] = useState<Career[]>([]);
  const [careerId, setCareerId] = useState(initialCareerId ?? String(user.targetRole?.id ?? ''));
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request<Career[]>('/careers')
      .then(setCareers)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load careers.'));
  }, []);

  useEffect(() => {
    if (!careerId) {
      setAnalysis(null);
      return;
    }
    setError('');
    request<Analysis>(`/me/career-analysis/${careerId}`, token)
      .then(setAnalysis)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load analysis.'));
  }, [careerId, token]);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your personalised learning plan</p>
          <h1>Skill gap analyzer</h1>
          <p className="muted">See how your current skills compare with a career’s real requirements.</p>
        </div>
        <button className="secondary-button" onClick={() => navigate('/assessments')}>
          Improve with an assessment
        </button>
      </div>

      <label className="select-label" htmlFor="career-select">
        Analyse a career
        <select
          id="career-select"
          value={careerId}
          onChange={(event) => {
            setCareerId(event.target.value);
            navigate(`/skill-gap?career=${event.target.value}`);
          }}
        >
          <option value="">Choose a career</option>
          {careers.map((career) => (
            <option key={career.id} value={career.id}>
              {career.name}
            </option>
          ))}
        </select>
      </label>

      {error && <ErrorState message={error} />}

      {analysis && (
        <>
          <section className="analysis-hero">
            <div>
              <p className="section-kicker">{analysis.career.category}</p>
              <h2>{analysis.career.name}</h2>
              <p>Your match is calculated from required skill levels and importance, not a generic average.</p>
            </div>
            <div className="match-score">
              <strong>{analysis.matchScore}%</strong>
              <span>career match</span>
            </div>
          </section>

          <div className="metric-grid compact">
            <Metric label="Missing" value={String(analysis.summary.missingSkills)} detail="Skills with no recorded level" accent="red" />
            <Metric label="Building next" value={String(analysis.summary.skillsToImprove)} detail={`${analysis.summary.significantGaps} significant gaps`} accent="orange" />
            <Metric label="Strong" value={String(analysis.summary.strongSkills)} detail="At or above the role level" accent="green" />
            <Metric label="Skills compared" value={String(analysis.skills.length)} detail="Required by this role" />
          </div>

          <div className="gap-grid">
            {[...analysis.skills]
              .sort((left, right) => right.priorityScore - left.priorityScore || left.skill.localeCompare(right.skill))
              .map((skill) => (
                <GapCard key={skill.skill} skill={skill} />
              ))}
          </div>
        </>
      )}

      {!careerId && (
        <Empty
          title="Choose a role to begin"
          text="Select a career to see the exact skills that will make the biggest difference."
          action="Choose target role"
          path="/target-role"
        />
      )}
    </div>
  );
}

export function AssessmentsPage({ token }: { token: string }): ReactElement {
  const [items, setItems] = useState<AssessmentListItem[] | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    request<AssessmentListItem[]>('/assessments', token)
      .then(setItems)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load assessments.'));
  }, [token]);

  async function start(skillId: number) {
    try {
      const item = await request<Assessment>(`/assessments/skill/${skillId}`, token);
      setAssessment(item);
      setAnswers({});
      setIndex(0);
      setResult(null);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to start assessment.');
    }
  }

  async function submit() {
    if (!assessment || busy) return;
    setBusy(true);
    setError('');
    try {
      const payload = assessment.questions.map((question) => ({
        questionId: question.id,
        optionIndex: answers[question.id],
      }));
      const response = await request<AssessmentResult>(`/assessments/${assessment.id}/submit`, token, {
        method: 'POST',
        body: JSON.stringify({ answers: payload }),
      });
      setResult(response);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit assessment.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !items) return <ErrorState message={error} />;
  if (!items) return <Loading message="Preparing your assessments…" />;
  if (result) return <div className="page"><AssessmentResultCard result={result} /></div>;

  if (assessment) {
    const question = assessment.questions[index];
    const answered = answers[question.id] !== undefined;
    const complete = Object.keys(answers).length === assessment.questions.length;

    return (
      <div className="page assessment-flow">
        <button className="back-button" onClick={() => setAssessment(null)}>
          ← Back to assessments
        </button>
        <div className="assessment-heading">
          <div>
            <p className="eyebrow">
              {assessment.skill.category} · {assessment.title}
            </p>
            <h1>{assessment.skill.name} assessment</h1>
          </div>
          <span>
            {index + 1} / {assessment.questions.length}
          </span>
        </div>
        <div className="assessment-progress">
          <ProgressBar value={((index + 1) / assessment.questions.length) * 100} />
          <span>{Math.round(((index + 1) / assessment.questions.length) * 100)}% complete</span>
        </div>
        <section className="question-card">
          <p className="question-number">Question {index + 1}</p>
          <h2>{question.prompt}</h2>
          <div className="options">
            {question.options.map((option, optionIndex) => (
              <label key={option} className={`option ${answers[question.id] === optionIndex ? 'chosen' : ''}`}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === optionIndex}
                  onChange={() => setAnswers({ ...answers, [question.id]: optionIndex })}
                />
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </label>
            ))}
          </div>
        </section>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="assessment-controls">
          <button className="secondary-button" disabled={index === 0 || busy} onClick={() => setIndex(index - 1)}>
            Previous
          </button>
          {index < assessment.questions.length - 1 ? (
            <button className="primary-button" disabled={!answered || busy} onClick={() => setIndex(index + 1)}>
              Next question
            </button>
          ) : (
            <button className="primary-button" disabled={!complete || busy} onClick={submit}>
              {busy ? 'Submitting answers…' : 'Submit assessment'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Prove what you know</p>
          <h1>Skill assessments</h1>
          <p className="muted">Short, focused questions update your profile with a verified skill level.</p>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="assessment-intro">
        <div>
          <strong>How it works</strong>
          <span>Choose a skill → answer the questions → get a score → see your recommendations update.</span>
        </div>
        <span>Only your submitted answers update proficiency.</span>
      </section>

      <div className="assessment-grid">
        {items.map((item) => (
          <section className="card assessment-card" key={item.id}>
            <div className="assessment-card-top">
              <Badge tone="category">{item.skill.category}</Badge>
              <span>{item._count.questions} questions</span>
            </div>
            <h2>{item.skill.name}</h2>
            <p>{item.title}</p>
            <small>Usually takes about 2 minutes</small>
            <button className="primary-button" onClick={() => start(item.skill.id)}>
              Start assessment
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   10. AppShell Router & Global Lifted State
   ========================================================================= */
export function AppShell({
  token,
  user,
  onLogout,
  onUserUpdated,
}: {
  token: string;
  user: User;
  onLogout: () => void;
  onUserUpdated: (user: User) => void;
}): ReactElement {
  const [route, setRoute] = useState(routeKey());
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sprints, setSprints] = useState<SkillSprint[]>(getStoredSprints);
  const [internships, setInternships] = useState<Internship[]>(getStoredInternships);
  const [shortlistedIds, setShortlistedIds] = useState<number[]>(getStoredShortlisted);
  const [appliedInternshipIds, setAppliedInternshipIds] = useState<number[]>(getStoredApplied);
  const [enrolledSprintIds, setEnrolledSprintIds] = useState<number[]>(getStoredEnrollments);
  const [skills, setSkills] = useState<Skill[]>(getLocalSkills);

  // Initialize theme on mount
  useEffect(() => {
    const isDark = localStorage.getItem(themeStorageKey) === 'dark';
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);

  useEffect(() => {
    const listener = () => setRoute(routeKey());
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.recipientRole === user.accountType || n.recipientRole === 'all'),
  ).length;

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  }

  function handleNotificationAction(item: NotificationItem) {
    if (item.actionPayload?.type === 'enroll_sprint') {
      const sprintId = item.actionPayload.targetId;
      if (!enrolledSprintIds.includes(sprintId)) {
        const next = [...enrolledSprintIds, sprintId];
        setEnrolledSprintIds(next);
        saveStoredEnrollments(next);
      }
      navigate('/sprints');
    } else if (item.actionPayload?.type === 'apply_internship') {
      const internshipId = item.actionPayload.targetId;
      if (!appliedInternshipIds.includes(internshipId)) {
        const next = [...appliedInternshipIds, internshipId];
        setAppliedInternshipIds(next);
        saveStoredApplied(next);
      }
      navigate('/internships');
    }

    // Mark as read
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
    setShowNotifications(false);
  }

  function handleLaunchSprint(newSprint: SkillSprint) {
    const nextSprints = [newSprint, ...sprints];
    setSprints(nextSprints);
    saveStoredSprints(nextSprints);

    // Emit real-time notification to students
    const studentNotification: NotificationItem = {
      id: Date.now(),
      recipientRole: 'student',
      title: `New Skill Sprint: ${newSprint.title}`,
      message: `${newSprint.company} launched a new sprint for ${newSprint.skill}. Enroll now to build verified proof of work!`,
      timestamp: 'Just now',
      read: false,
      type: 'sprint',
      actionLabel: 'Enroll Now',
      actionPayload: { type: 'enroll_sprint', targetId: newSprint.id, title: newSprint.title },
    };

    const nextNotifications = [studentNotification, ...notifications];
    setNotifications(nextNotifications);
    saveStoredNotifications(nextNotifications);
  }

  function handlePostInternship(newInternship: Internship) {
    const nextInternships = [newInternship, ...internships];
    setInternships(nextInternships);
    saveStoredInternships(nextInternships);

    // Emit notification to students and colleges
    const studentNotif: NotificationItem = {
      id: Date.now(),
      recipientRole: 'student',
      title: `New Internship: ${newInternship.title}`,
      message: `${newInternship.company} is hiring for ${newInternship.stipend}. Apply directly with your verified skills.`,
      timestamp: 'Just now',
      read: false,
      type: 'internship',
      actionLabel: 'Apply Now',
      actionPayload: { type: 'apply_internship', targetId: newInternship.id, title: newInternship.title },
    };

    const collegeNotif: NotificationItem = {
      id: Date.now() + 1,
      recipientRole: 'college',
      title: `Hiring Partner Update: ${newInternship.company}`,
      message: `${newInternship.company} posted ${newInternship.title}. Review cohort role readiness to match candidates.`,
      timestamp: 'Just now',
      read: false,
      type: 'internship',
    };

    const nextNotifications = [studentNotif, collegeNotif, ...notifications];
    setNotifications(nextNotifications);
    saveStoredNotifications(nextNotifications);
  }

  function handleApplyInternship(internship: Internship) {
    if (!appliedInternshipIds.includes(internship.id)) {
      const nextApplied = [...appliedInternshipIds, internship.id];
      setAppliedInternshipIds(nextApplied);
      saveStoredApplied(nextApplied);

      const nextInternships = internships.map((item) =>
        item.id === internship.id ? { ...item, applicantsCount: item.applicantsCount + 1 } : item,
      );
      setInternships(nextInternships);
      saveStoredInternships(nextInternships);

      // Emit notification to company
      const companyNotif: NotificationItem = {
        id: Date.now(),
        recipientRole: 'company',
        title: `New Applicant: ${user.name}`,
        message: `${user.name} applied for "${internship.title}" with verified skill proficiencies.`,
        timestamp: 'Just now',
        read: false,
        type: 'internship',
      };
      const nextNotifications = [companyNotif, ...notifications];
      setNotifications(nextNotifications);
      saveStoredNotifications(nextNotifications);
    }
  }

  function handleToggleShortlist(student: StudentProfileData) {
    const isNow = !shortlistedIds.includes(student.id);
    const updated = isNow ? [...shortlistedIds, student.id] : shortlistedIds.filter((id) => id !== student.id);
    setShortlistedIds(updated);
    saveStoredShortlisted(updated);
  }

  const currentPath = new URL(route, window.location.origin).pathname;
  const queriedCareerId = new URL(route, window.location.origin).searchParams.get('career');
  const navigation =
    user.accountType === 'college'
      ? collegeNavigation
      : user.accountType === 'company'
        ? companyNavigation
        : studentNavigation;

  const workspaceLabel =
    user.accountType === 'college'
      ? 'College workspace'
      : user.accountType === 'company'
        ? 'Company workspace'
        : 'Student workspace';

  let page: ReactElement;
  if (user.accountType === 'college') {
    if (currentPath === '/sprints') page = <CollegeDashboard user={user} focus="sprints" sprints={sprints} onLaunchSprint={handleLaunchSprint} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/readiness') page = <CollegeDashboard user={user} focus="readiness" sprints={sprints} onLaunchSprint={handleLaunchSprint} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/students') page = <CollegeDashboard user={user} focus="students" sprints={sprints} onLaunchSprint={handleLaunchSprint} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/settings') page = <CollegeDashboard user={user} focus="settings" sprints={sprints} onLaunchSprint={handleLaunchSprint} onUserUpdated={onUserUpdated} />;
    else page = <CollegeDashboard user={user} sprints={sprints} onLaunchSprint={handleLaunchSprint} onUserUpdated={onUserUpdated} />;
  } else if (user.accountType === 'company') {
    if (currentPath === '/discovery') page = <CompanyDashboard user={user} focus="discovery" internships={internships} shortlistedIds={shortlistedIds} onPostInternship={handlePostInternship} onToggleShortlist={handleToggleShortlist} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/shortlist') page = <CompanyDashboard user={user} focus="shortlist" internships={internships} shortlistedIds={shortlistedIds} onPostInternship={handlePostInternship} onToggleShortlist={handleToggleShortlist} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/internships') page = <CompanyDashboard user={user} focus="internships" internships={internships} shortlistedIds={shortlistedIds} onPostInternship={handlePostInternship} onToggleShortlist={handleToggleShortlist} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/settings') page = <CompanyDashboard user={user} focus="settings" internships={internships} shortlistedIds={shortlistedIds} onPostInternship={handlePostInternship} onToggleShortlist={handleToggleShortlist} onUserUpdated={onUserUpdated} />;
    else page = <CompanyDashboard user={user} internships={internships} shortlistedIds={shortlistedIds} onPostInternship={handlePostInternship} onToggleShortlist={handleToggleShortlist} onUserUpdated={onUserUpdated} />;
  } else {
    // Student Account Routes
    if (currentPath === '/recommendations') page = <RecommendationsPage token={token} />;
    else if (currentPath === '/skills') page = <SkillsPage token={token} />;
    else if (currentPath === '/target-role') page = <TargetRolePage token={token} user={user} onUserUpdated={onUserUpdated} />;
    else if (currentPath === '/skill-gap') page = <SkillGapPage token={token} user={user} initialCareerId={queriedCareerId} />;
    else if (currentPath === '/assessments' || currentPath === '/assessment') page = <AssessmentsPage token={token} />;
    else if (currentPath === '/roadmap') page = <AiRoadmapPage user={user} />;
    else if (currentPath === '/internships') page = <StudentInternshipsPage token={token} internships={internships} appliedIds={appliedInternshipIds} onApply={handleApplyInternship} />;
    else if (currentPath === '/settings') page = <StudentSettingsPage user={user} onUserUpdated={onUserUpdated} />;
    else page = <Dashboard token={token} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand sidebar-brand" onClick={() => navigate('/dashboard')}>
          <span>✦</span> AchieveCell
        </button>
        <p className="sidebar-label">{workspaceLabel}</p>
        <nav>
          {navigation.map(([href, label, icon]) => (
            <button
              className={
                currentPath === href ||
                (href === '/assessments' && currentPath === '/assessment') ||
                (href === '/discovery' && currentPath === '/discovery') ||
                (href === '/readiness' && currentPath === '/readiness')
                  ? 'nav-active'
                  : ''
              }
              key={href}
              onClick={() => navigate(href)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {user.accountType === 'student' && (
            <button onClick={() => navigate('/target-role')}>
              <span>◎</span>Target Role
            </button>
          )}
          <button onClick={onLogout}>
            <span>↪</span>Log out
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header>
          <div>
            <p className="mobile-brand">✦ AchieveCell</p>
            <span className="header-label">
              {workspaceLabel} · {user.accountType === 'student' ? user.targetRole?.name ?? 'Choose a target role' : user.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', position: 'relative' }}>
            {/* Live Notification Bell */}
            <button
              className="ghost-button"
              onClick={() => setShowNotifications((prev) => !prev)}
              style={{
                position: 'relative',
                padding: '.6rem .75rem',
                borderRadius: '.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
              }}
              aria-label="Notification center"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#e02424',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Chip */}
            <button
              className="profile-chip"
              onClick={() => navigate(user.accountType === 'student' ? '/target-role' : '/settings')}
            >
              <span>{user.name.charAt(0)}</span>
              <div>
                <small>Signed in as</small>
                <b>{user.name}</b>
              </div>
            </button>

            {/* Notification Center Dropdown */}
            {showNotifications && (
              <NotificationDropdown
                notifications={notifications}
                accountType={user.accountType}
                onClose={() => setShowNotifications(false)}
                onAction={handleNotificationAction}
                onMarkAllRead={markAllRead}
              />
            )}
          </div>
        </header>

        <main>{page}</main>

        {/* Always-on Floating AI Assistant for Students */}
        {user.accountType === 'student' && <FloatingAiAssistant user={user} skills={skills} />}
      </div>
    </div>
  );
}

export default function App(): ReactElement {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(Boolean(token));

  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(accountTypeKey);
    setToken(null);
    setUser(null);
    navigate('/login');
  }, []);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    request<Omit<User, 'accountType'>>('/me', token)
      .then((profile) => setUser(withAccountType(profile)))
      .catch(logout)
      .finally(() => setChecking(false));
  }, [token, logout]);

  if (checking) return <Loading message="Checking your secure session…" />;

  const path = window.location.pathname;

  if (!token || !user) {
    return (
      <AuthPage
        mode={path === '/register' ? 'register' : 'login'}
        onAuthenticated={(nextToken, nextUser) => {
          localStorage.setItem(tokenKey, nextToken);
          localStorage.setItem(accountTypeKey, nextUser.accountType);
          setToken(nextToken);
          setUser(nextUser);
        }}
      />
    );
  }

  if (path === '/login' || path === '/register' || path === '/') {
    navigate('/dashboard');
  }

  return <AppShell token={token} user={user} onLogout={logout} onUserUpdated={setUser} />;
}
