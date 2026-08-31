import { PrismaClient, SkillSource } from '@prisma/client';
import { hashPassword } from '../src/utils/passwords.js';

const prisma = new PrismaClient();

const skills = [
  ['Python', 'Programming', 'General-purpose programming language used in data, automation, and backend work.'],
  ['Java', 'Programming', 'Object-oriented programming language used for enterprise and Android development.'],
  ['JavaScript', 'Programming', 'Core programming language of the web.'],
  ['TypeScript', 'Programming', 'Typed superset of JavaScript for maintainable applications.'],
  ['C', 'Programming', 'Low-level systems programming language.'],
  ['C++', 'Programming', 'Performance-focused language for systems and application development.'],
  ['HTML', 'Frontend', 'Markup language for web page structure.'],
  ['CSS', 'Frontend', 'Styling language for web interfaces.'],
  ['React', 'Frontend', 'JavaScript library for component-based user interfaces.'],
  ['Next.js', 'Frontend', 'React framework for production web applications.'],
  ['Node.js', 'Backend', 'JavaScript runtime for server-side applications.'],
  ['Express.js', 'Backend', 'Minimal web framework for Node.js APIs.'],
  ['REST APIs', 'Backend', 'Design and integration of resource-oriented HTTP APIs.'],
  ['SQL', 'Database', 'Language for querying and managing relational databases.'],
  ['PostgreSQL', 'Database', 'Open-source relational database system.'],
  ['MongoDB', 'Database', 'Document-oriented NoSQL database.'],
  ['Database Design', 'Database', 'Modeling normalized, reliable, and scalable data structures.'],
  ['Git', 'Tools', 'Distributed version control system.'],
  ['GitHub', 'Tools', 'Collaborative Git hosting and code review platform.'],
  ['Docker', 'DevOps', 'Containerization platform for consistent application delivery.'],
  ['CI/CD', 'DevOps', 'Automated build, test, and deployment practices.'],
  ['AWS', 'Cloud', 'Cloud computing services and infrastructure.'],
  ['Linux', 'Cloud', 'Linux command line and server operating system fundamentals.'],
  ['Machine Learning', 'AI/ML', 'Techniques for building predictive models from data.'],
  ['Deep Learning', 'AI/ML', 'Neural-network methods for advanced machine learning.'],
  ['Data Analysis', 'Data Science', 'Exploring, cleaning, and interpreting data.'],
  ['Statistics', 'Data Science', 'Statistical reasoning and inference for data-driven work.'],
  ['Pandas', 'Data Science', 'Python library for tabular data analysis.'],
  ['NumPy', 'Data Science', 'Python library for numerical computing.'],
  ['Data Visualization', 'Data Science', 'Communicating data through useful charts and visuals.'],
  ['Data Structures', 'Computer Science', 'Fundamental ways to organize data efficiently.'],
  ['Algorithms', 'Computer Science', 'Methods for solving computational problems efficiently.'],
  ['Operating Systems', 'Computer Science', 'Core operating-system concepts and process management.'],
  ['Computer Networks', 'Computer Science', 'Networking protocols, architecture, and troubleshooting.'],
  ['Cybersecurity', 'Security', 'Foundational application, network, and information security practices.'],
  ['Communication', 'Soft Skills', 'Clear written and verbal communication.'],
  ['Problem Solving', 'Soft Skills', 'Breaking down and resolving technical problems.'],
  ['Teamwork', 'Soft Skills', 'Collaborating effectively with a team.'],
] as const;

type CareerRequirement = {
  skill: string;
  importance: number;
  requiredLevel: number;
};

type CareerSeed = {
  name: string;
  category: string;
  description: string;
  requirements: CareerRequirement[];
};

const careers: CareerSeed[] = [
  {
    name: 'Full Stack Developer',
    category: 'Software Development',
    description: 'Builds complete web applications across frontend, backend, and data layers.',
    requirements: [
      { skill: 'JavaScript', importance: 90, requiredLevel: 80 }, { skill: 'React', importance: 85, requiredLevel: 75 },
      { skill: 'Node.js', importance: 90, requiredLevel: 70 }, { skill: 'Express.js', importance: 80, requiredLevel: 70 },
      { skill: 'SQL', importance: 70, requiredLevel: 65 }, { skill: 'PostgreSQL', importance: 70, requiredLevel: 60 },
      { skill: 'Git', importance: 60, requiredLevel: 60 }, { skill: 'REST APIs', importance: 80, requiredLevel: 70 },
      { skill: 'HTML', importance: 75, requiredLevel: 75 }, { skill: 'CSS', importance: 70, requiredLevel: 70 },
    ],
  },
  {
    name: 'Frontend Developer', category: 'Software Development',
    description: 'Creates accessible, responsive, and maintainable user interfaces.',
    requirements: [
      { skill: 'HTML', importance: 95, requiredLevel: 85 }, { skill: 'CSS', importance: 95, requiredLevel: 85 },
      { skill: 'JavaScript', importance: 95, requiredLevel: 85 }, { skill: 'TypeScript', importance: 80, requiredLevel: 70 },
      { skill: 'React', importance: 90, requiredLevel: 80 }, { skill: 'Git', importance: 65, requiredLevel: 60 },
      { skill: 'REST APIs', importance: 70, requiredLevel: 60 }, { skill: 'Communication', importance: 55, requiredLevel: 55 },
    ],
  },
  {
    name: 'Backend Developer', category: 'Software Development',
    description: 'Designs server-side services, APIs, and data access layers.',
    requirements: [
      { skill: 'Node.js', importance: 90, requiredLevel: 80 }, { skill: 'Express.js', importance: 85, requiredLevel: 75 },
      { skill: 'REST APIs', importance: 90, requiredLevel: 80 }, { skill: 'SQL', importance: 85, requiredLevel: 75 },
      { skill: 'PostgreSQL', importance: 80, requiredLevel: 70 }, { skill: 'Database Design', importance: 80, requiredLevel: 70 },
      { skill: 'Git', importance: 65, requiredLevel: 60 }, { skill: 'Docker', importance: 65, requiredLevel: 55 },
    ],
  },
  {
    name: 'Software Engineer', category: 'Software Development',
    description: 'Builds reliable software systems using sound engineering fundamentals.',
    requirements: [
      { skill: 'Data Structures', importance: 95, requiredLevel: 80 }, { skill: 'Algorithms', importance: 95, requiredLevel: 80 },
      { skill: 'Java', importance: 75, requiredLevel: 65 }, { skill: 'Python', importance: 75, requiredLevel: 65 },
      { skill: 'Git', importance: 70, requiredLevel: 65 }, { skill: 'Problem Solving', importance: 90, requiredLevel: 80 },
      { skill: 'Communication', importance: 60, requiredLevel: 60 }, { skill: 'Operating Systems', importance: 65, requiredLevel: 60 },
    ],
  },
  {
    name: 'Data Analyst', category: 'Data',
    description: 'Turns data into useful reports, insights, and business decisions.',
    requirements: [
      { skill: 'SQL', importance: 95, requiredLevel: 85 }, { skill: 'Data Analysis', importance: 95, requiredLevel: 85 },
      { skill: 'Data Visualization', importance: 85, requiredLevel: 75 }, { skill: 'Statistics', importance: 80, requiredLevel: 70 },
      { skill: 'Python', importance: 75, requiredLevel: 65 }, { skill: 'Pandas', importance: 80, requiredLevel: 70 },
      { skill: 'Communication', importance: 75, requiredLevel: 70 }, { skill: 'Problem Solving', importance: 70, requiredLevel: 65 },
    ],
  },
  {
    name: 'Data Scientist', category: 'Data',
    description: 'Builds statistical and machine-learning models to solve data problems.',
    requirements: [
      { skill: 'Python', importance: 95, requiredLevel: 85 }, { skill: 'Machine Learning', importance: 95, requiredLevel: 85 },
      { skill: 'Statistics', importance: 90, requiredLevel: 80 }, { skill: 'SQL', importance: 80, requiredLevel: 70 },
      { skill: 'Pandas', importance: 80, requiredLevel: 75 }, { skill: 'NumPy', importance: 75, requiredLevel: 70 },
      { skill: 'Data Visualization', importance: 70, requiredLevel: 65 }, { skill: 'Communication', importance: 60, requiredLevel: 60 },
    ],
  },
  {
    name: 'Machine Learning Engineer', category: 'AI/ML',
    description: 'Develops, deploys, and maintains machine-learning systems.',
    requirements: [
      { skill: 'Python', importance: 95, requiredLevel: 85 }, { skill: 'Machine Learning', importance: 95, requiredLevel: 85 },
      { skill: 'Deep Learning', importance: 80, requiredLevel: 70 }, { skill: 'Data Structures', importance: 75, requiredLevel: 70 },
      { skill: 'Docker', importance: 75, requiredLevel: 65 }, { skill: 'AWS', importance: 70, requiredLevel: 60 },
      { skill: 'SQL', importance: 70, requiredLevel: 65 }, { skill: 'Git', importance: 65, requiredLevel: 60 },
    ],
  },
  {
    name: 'AI Engineer', category: 'AI/ML',
    description: 'Builds production applications that use artificial intelligence capabilities.',
    requirements: [
      { skill: 'Python', importance: 95, requiredLevel: 85 }, { skill: 'Machine Learning', importance: 90, requiredLevel: 80 },
      { skill: 'Deep Learning', importance: 85, requiredLevel: 75 }, { skill: 'REST APIs', importance: 75, requiredLevel: 65 },
      { skill: 'Docker', importance: 70, requiredLevel: 60 }, { skill: 'AWS', importance: 70, requiredLevel: 60 },
      { skill: 'Git', importance: 65, requiredLevel: 60 }, { skill: 'Problem Solving', importance: 85, requiredLevel: 75 },
    ],
  },
  {
    name: 'Cloud Engineer', category: 'Cloud',
    description: 'Designs and operates cloud infrastructure and platform services.',
    requirements: [
      { skill: 'AWS', importance: 95, requiredLevel: 85 }, { skill: 'Linux', importance: 90, requiredLevel: 80 },
      { skill: 'Docker', importance: 85, requiredLevel: 75 }, { skill: 'CI/CD', importance: 80, requiredLevel: 70 },
      { skill: 'Computer Networks', importance: 80, requiredLevel: 70 }, { skill: 'Git', importance: 70, requiredLevel: 65 },
      { skill: 'Python', importance: 65, requiredLevel: 60 }, { skill: 'Problem Solving', importance: 70, requiredLevel: 65 },
    ],
  },
  {
    name: 'DevOps Engineer', category: 'DevOps',
    description: 'Improves software delivery through automation, infrastructure, and reliability practices.',
    requirements: [
      { skill: 'Docker', importance: 95, requiredLevel: 85 }, { skill: 'CI/CD', importance: 95, requiredLevel: 85 },
      { skill: 'Linux', importance: 90, requiredLevel: 80 }, { skill: 'AWS', importance: 80, requiredLevel: 70 },
      { skill: 'Git', importance: 75, requiredLevel: 70 }, { skill: 'Python', importance: 70, requiredLevel: 65 },
      { skill: 'Computer Networks', importance: 70, requiredLevel: 65 }, { skill: 'Problem Solving', importance: 70, requiredLevel: 65 },
    ],
  },
  {
    name: 'Cybersecurity Analyst', category: 'Security',
    description: 'Protects systems and data by identifying, monitoring, and reducing security risks.',
    requirements: [
      { skill: 'Cybersecurity', importance: 95, requiredLevel: 85 }, { skill: 'Computer Networks', importance: 90, requiredLevel: 80 },
      { skill: 'Linux', importance: 80, requiredLevel: 70 }, { skill: 'Python', importance: 70, requiredLevel: 60 },
      { skill: 'Operating Systems', importance: 80, requiredLevel: 70 }, { skill: 'Problem Solving', importance: 85, requiredLevel: 75 },
      { skill: 'Communication', importance: 65, requiredLevel: 60 }, { skill: 'Git', importance: 50, requiredLevel: 50 },
    ],
  },
  {
    name: 'Database Administrator', category: 'Database',
    description: 'Maintains database reliability, performance, backup, and access controls.',
    requirements: [
      { skill: 'SQL', importance: 95, requiredLevel: 85 }, { skill: 'PostgreSQL', importance: 95, requiredLevel: 85 },
      { skill: 'Database Design', importance: 90, requiredLevel: 80 }, { skill: 'Linux', importance: 70, requiredLevel: 65 },
      { skill: 'AWS', importance: 60, requiredLevel: 55 }, { skill: 'Problem Solving', importance: 75, requiredLevel: 70 },
      { skill: 'Communication', importance: 60, requiredLevel: 60 }, { skill: 'Git', importance: 50, requiredLevel: 50 },
    ],
  },
];

const ananyaSkills: Array<{ skill: string; proficiency: number; source: SkillSource }> = [
  { skill: 'Python', proficiency: 90, source: SkillSource.assessment },
  { skill: 'Git', proficiency: 85, source: SkillSource.assessment },
  { skill: 'SQL', proficiency: 75, source: SkillSource.assessment },
  { skill: 'JavaScript', proficiency: 60, source: SkillSource.assessment },
  { skill: 'HTML', proficiency: 65, source: SkillSource.self_reported },
  { skill: 'CSS', proficiency: 55, source: SkillSource.self_reported },
  { skill: 'Data Structures', proficiency: 70, source: SkillSource.assessment },
  { skill: 'Algorithms', proficiency: 65, source: SkillSource.assessment },
  { skill: 'Java', proficiency: 50, source: SkillSource.self_reported },
  { skill: 'React', proficiency: 30, source: SkillSource.project },
  { skill: 'Node.js', proficiency: 35, source: SkillSource.project },
  { skill: 'Communication', proficiency: 75, source: SkillSource.self_reported },
];

type QuestionSeed = { prompt: string; options: string[]; correctOption: number };

const assessmentQuestions: Record<string, QuestionSeed[]> = {
  JavaScript: [
    { prompt: 'Which keyword declares a block-scoped variable that can be reassigned?', options: ['var', 'let', 'const', 'static'], correctOption: 1 },
    { prompt: 'What does Array.map return?', options: ['A new transformed array', 'The first item only', 'Nothing', 'A boolean'], correctOption: 0 },
    { prompt: 'Which operator checks both value and type?', options: ['=', '==', '===', '!='], correctOption: 2 },
  ],
  React: [
    { prompt: 'What is used to store state in a function component?', options: ['useState', 'useClass', 'setProps', 'renderState'], correctOption: 0 },
    { prompt: 'Why does a list item need a key prop?', options: ['To identify items between renders', 'To add CSS', 'To make it clickable', 'To fetch data'], correctOption: 0 },
    { prompt: 'Props are primarily used to:', options: ['Pass data into components', 'Store private state', 'Create databases', 'Compile CSS'], correctOption: 0 },
  ],
  'Node.js': [
    { prompt: 'Node.js is primarily a:', options: ['Browser plugin', 'JavaScript runtime', 'Database', 'CSS framework'], correctOption: 1 },
    { prompt: 'Which module lets Node.js work with file paths?', options: ['path', 'httpOnly', 'router', 'state'], correctOption: 0 },
    { prompt: 'npm is commonly used to:', options: ['Manage packages', 'Render HTML only', 'Store SQL data', 'Create CSS'], correctOption: 0 },
  ],
  SQL: [
    { prompt: 'Which SQL statement retrieves data?', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], correctOption: 0 },
    { prompt: 'Which clause filters rows?', options: ['WHERE', 'ORDER', 'GROUP', 'FROM'], correctOption: 0 },
    { prompt: 'A primary key should be:', options: ['Unique for each row', 'Always text', 'Optional', 'Duplicated'], correctOption: 0 },
  ],
  Python: [
    { prompt: 'Which Python collection is mutable and ordered?', options: ['tuple', 'list', 'set', 'string'], correctOption: 1 },
    { prompt: 'What keyword defines a function?', options: ['func', 'def', 'function', 'lambdaOnly'], correctOption: 1 },
    { prompt: 'Which operator raises a number to a power?', options: ['^', '**', '//', '%'], correctOption: 1 },
  ],
  HTML: [
    { prompt: 'Which element represents the main content of a page?', options: ['main', 'div', 'span', 'style'], correctOption: 0 },
    { prompt: 'Which attribute gives an image alternative text?', options: ['alt', 'href', 'srcsetOnly', 'titleOnly'], correctOption: 0 },
    { prompt: 'Which tag creates a hyperlink?', options: ['a', 'link', 'p', 'button'], correctOption: 0 },
  ],
  CSS: [
    { prompt: 'Which property changes text color?', options: ['font-color', 'color', 'text-style', 'foreground'], correctOption: 1 },
    { prompt: 'Which layout system is one-dimensional?', options: ['Flexbox', 'Grid', 'Table', 'Float only'], correctOption: 0 },
    { prompt: 'What does margin control?', options: ['Space outside an element', 'Text size', 'Border color', 'Image source'], correctOption: 0 },
  ],
  Git: [
    { prompt: 'Which command records staged changes?', options: ['git commit', 'git clone', 'git status', 'git branch'], correctOption: 0 },
    { prompt: 'What does git pull do?', options: ['Fetches and integrates remote changes', 'Deletes history', 'Creates a database', 'Only checks status'], correctOption: 0 },
    { prompt: 'Which command shows changed files?', options: ['git status', 'git push', 'git init', 'git remote'], correctOption: 0 },
  ],
};

function assertPercentage(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be an integer between 0 and 100.`);
  }
}

async function main(): Promise<void> {
  for (const [name, category, description] of skills) {
    await prisma.skill.upsert({
      where: { name },
      update: { category, description },
      create: { name, category, description },
    });
  }

  const skillRecords = await prisma.skill.findMany({ select: { id: true, name: true } });
  const skillIdByName = new Map(skillRecords.map((skill) => [skill.name, skill.id]));

  for (const [skillName, questions] of Object.entries(assessmentQuestions)) {
    const skillId = skillIdByName.get(skillName);
    if (!skillId) throw new Error(`Unknown assessment skill: ${skillName}`);
    const assessment = await prisma.assessment.upsert({
      where: { skillId },
      update: { title: `${skillName} Fundamentals` },
      create: { skillId, title: `${skillName} Fundamentals` },
    });
    for (const [index, question] of questions.entries()) {
      await prisma.assessmentQuestion.upsert({
        where: { assessmentId_order: { assessmentId: assessment.id, order: index + 1 } },
        update: question,
        create: { assessmentId: assessment.id, order: index + 1, ...question },
      });
    }
  }

  for (const career of careers) {
    const role = await prisma.careerRole.upsert({
      where: { name: career.name },
      update: { category: career.category, description: career.description },
      create: { name: career.name, category: career.category, description: career.description },
    });

    for (const requirement of career.requirements) {
      assertPercentage(requirement.importance, 'importance');
      assertPercentage(requirement.requiredLevel, 'requiredLevel');
      const skillId = skillIdByName.get(requirement.skill);
      if (!skillId) throw new Error(`Unknown skill in career seed: ${requirement.skill}`);

      await prisma.careerSkill.upsert({
        where: { careerRoleId_skillId: { careerRoleId: role.id, skillId } },
        update: { importance: requirement.importance, requiredLevel: requirement.requiredLevel },
        create: { careerRoleId: role.id, skillId, importance: requirement.importance, requiredLevel: requirement.requiredLevel },
      });
    }
  }

  const fullStackRole = await prisma.careerRole.findUniqueOrThrow({ where: { name: 'Full Stack Developer' } });
  const ananya = await prisma.user.upsert({
    where: { email: 'ananya.sharma@achievecell.demo' },
    update: { name: 'Ananya Sharma', education: 'B.Tech CSE', year: 2, targetRoleId: fullStackRole.id, passwordHash: hashPassword('DemoPassword123!') },
    create: {
      name: 'Ananya Sharma',
      email: 'ananya.sharma@achievecell.demo',
      education: 'B.Tech CSE',
      year: 2,
      targetRoleId: fullStackRole.id,
      passwordHash: hashPassword('DemoPassword123!'),
    },
  });

  for (const userSkill of ananyaSkills) {
    assertPercentage(userSkill.proficiency, 'proficiency');
    const skillId = skillIdByName.get(userSkill.skill);
    if (!skillId) throw new Error(`Unknown skill in user seed: ${userSkill.skill}`);

    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: ananya.id, skillId } },
      update: { proficiency: userSkill.proficiency, source: userSkill.source },
      create: { userId: ananya.id, skillId, proficiency: userSkill.proficiency, source: userSkill.source },
    });
  }

  console.log(`Seed complete: ${skills.length} skills, ${careers.length} career roles, and demo user ${ananya.name} (ID ${ananya.id}).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
