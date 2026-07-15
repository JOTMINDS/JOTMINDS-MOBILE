/**
 * Tertiary program catalogue used by calculateSHSScores's topPrograms
 * recommendation — verbatim port of the webapp's shsThinkingData.ts's
 * tertiaryPrograms.
 */
export interface TertiaryProgram {
  name: string;
  description: string;
  thinkingStyles: string[];
  careerPaths: string[];
  universities: string[];
  skills: string[];
}

export const tertiaryPrograms: TertiaryProgram[] = [
  // Creative-focused programs
  {
    name: 'BS Architecture',
    description: 'Design and plan buildings, structures, and spaces that are both functional and aesthetically pleasing',
    thinkingStyles: ['creative', 'analytical', 'practical'],
    careerPaths: ['Architect', 'Urban Planner', 'Interior Designer', 'Landscape Architect'],
    universities: ['UP Diliman', 'UST', 'Mapúa University', 'DLSU Manila'],
    skills: ['Spatial reasoning', 'Creative design', 'Technical drawing', 'Project management'],
  },
  {
    name: 'BA Fine Arts',
    description: 'Express ideas and emotions through visual media including painting, sculpture, and digital art',
    thinkingStyles: ['creative', 'reflective'],
    careerPaths: ['Visual Artist', 'Art Director', 'Gallery Curator', 'Art Teacher'],
    universities: ['UP Diliman', 'UST', 'DLSU-CSB', 'FEATI University'],
    skills: ['Artistic expression', 'Visual composition', 'Art history', 'Critical analysis'],
  },
  {
    name: 'BS Multimedia Arts',
    description: 'Create digital content combining graphics, animation, video, and interactive media',
    thinkingStyles: ['creative', 'practical'],
    careerPaths: ['Graphic Designer', 'Animator', 'UX/UI Designer', 'Video Editor'],
    universities: ['DLSU-CSB', 'Mapúa University', 'Adamson University', 'FEU'],
    skills: ['Digital design', 'Animation', 'Video production', 'User experience'],
  },
  {
    name: 'BA Communication',
    description: 'Study media, journalism, public relations, and strategic communication',
    thinkingStyles: ['creative', 'analytical', 'practical'],
    careerPaths: ['Journalist', 'PR Specialist', 'Content Creator', 'Marketing Manager'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Writing', 'Public speaking', 'Media literacy', 'Strategic thinking'],
  },
  {
    name: 'BA Creative Writing',
    description: 'Develop skills in fiction, poetry, creative nonfiction, and screenwriting',
    thinkingStyles: ['creative', 'reflective'],
    careerPaths: ['Author', 'Screenwriter', 'Editor', 'Content Writer'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'Silliman University'],
    skills: ['Storytelling', 'Literary analysis', 'Editing', 'Research'],
  },

  // Analytical-focused programs
  {
    name: 'BS Computer Science',
    description: 'Study algorithms, programming, software development, and computational theory',
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['Software Engineer', 'Data Scientist', 'AI Specialist', 'Systems Architect'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'ADMU'],
    skills: ['Programming', 'Algorithm design', 'Problem-solving', 'Systems thinking'],
  },
  {
    name: 'BS Mathematics',
    description: 'Explore pure and applied mathematics, statistics, and mathematical modeling',
    thinkingStyles: ['analytical', 'reflective'],
    careerPaths: ['Mathematician', 'Actuary', 'Data Analyst', 'Research Scientist'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'UST', 'DLSU Manila'],
    skills: ['Mathematical reasoning', 'Abstract thinking', 'Statistical analysis', 'Proof writing'],
  },
  {
    name: 'BS Physics',
    description: 'Study matter, energy, and the fundamental laws governing the universe',
    thinkingStyles: ['analytical', 'reflective'],
    careerPaths: ['Physicist', 'Research Scientist', 'Data Scientist', 'Science Educator'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'UST', 'MSU-IIT'],
    skills: ['Scientific reasoning', 'Experimental design', 'Mathematical modeling', 'Critical thinking'],
  },
  {
    name: 'BS Chemistry',
    description: 'Investigate the composition, structure, properties, and changes of matter',
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['Chemist', 'Pharmaceutical Scientist', 'Quality Control Analyst', 'Research Scientist'],
    universities: ['UP Diliman', 'UST', 'Ateneo de Manila', 'DLSU Manila'],
    skills: ['Laboratory techniques', 'Chemical analysis', 'Problem-solving', 'Data interpretation'],
  },
  {
    name: 'BS Accountancy',
    description: 'Learn financial reporting, auditing, taxation, and business analysis',
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['CPA', 'Auditor', 'Financial Analyst', 'Tax Consultant'],
    universities: ['UST', 'DLSU Manila', 'UP Diliman', 'San Beda University'],
    skills: ['Financial analysis', 'Attention to detail', 'Regulatory knowledge', 'Ethics'],
  },

  // Practical-focused programs
  {
    name: 'BS Engineering (Various)',
    description: 'Apply science and mathematics to design, build, and maintain systems and structures',
    thinkingStyles: ['practical', 'analytical'],
    careerPaths: ['Engineer', 'Project Manager', 'Technical Consultant', 'R&D Specialist'],
    universities: ['UP Diliman', 'Mapúa University', 'DLSU Manila', 'Ateneo de Manila'],
    skills: ['Technical design', 'Problem-solving', 'Project management', 'Innovation'],
  },
  {
    name: 'BS Nursing',
    description: 'Provide patient care, health education, and medical support in healthcare settings',
    thinkingStyles: ['practical', 'reflective'],
    careerPaths: ['Registered Nurse', 'Nurse Practitioner', 'Healthcare Administrator', 'Clinical Specialist'],
    universities: ['UST', 'FEU', 'UP Manila', 'St. Paul University'],
    skills: ['Patient care', 'Medical knowledge', 'Compassion', 'Critical thinking'],
  },
  {
    name: 'BS Information Technology',
    description: 'Manage computer systems, networks, databases, and IT infrastructure',
    thinkingStyles: ['practical', 'analytical'],
    careerPaths: ['IT Specialist', 'Network Administrator', 'Database Manager', 'Cybersecurity Analyst'],
    universities: ['DLSU Manila', 'Mapúa University', 'TIP', 'AMA University'],
    skills: ['Systems management', 'Network configuration', 'Troubleshooting', 'Technical support'],
  },
  {
    name: 'BS Business Administration',
    description: 'Study management, marketing, finance, and entrepreneurship for business careers',
    thinkingStyles: ['practical', 'analytical'],
    careerPaths: ['Business Manager', 'Entrepreneur', 'Marketing Specialist', 'Operations Manager'],
    universities: ['DLSU Manila', 'Ateneo de Manila', 'UP Diliman', 'UST'],
    skills: ['Leadership', 'Strategic planning', 'Decision-making', 'Communication'],
  },
  {
    name: 'BS Hospitality Management',
    description: 'Learn hotel operations, tourism, event planning, and customer service excellence',
    thinkingStyles: ['practical', 'creative'],
    careerPaths: ['Hotel Manager', 'Event Coordinator', 'Tourism Officer', 'Restaurant Manager'],
    universities: ['DLSU-CSB', 'UST', 'FEU', 'Centro Escolar University'],
    skills: ['Customer service', 'Event management', 'Operations', 'Leadership'],
  },

  // Reflective-focused programs
  {
    name: 'BA Psychology',
    description: 'Study human behavior, mental processes, and psychological development',
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Psychologist', 'Counselor', 'HR Specialist', 'Researcher'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Emotional intelligence', 'Research methods', 'Counseling', 'Assessment'],
  },
  {
    name: 'BA Philosophy',
    description: 'Explore fundamental questions about existence, knowledge, values, and reasoning',
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Academic', 'Ethicist', 'Policy Analyst', 'Consultant'],
    universities: ['Ateneo de Manila', 'UST', 'UP Diliman', 'San Beda University'],
    skills: ['Critical thinking', 'Logical reasoning', 'Ethical analysis', 'Argumentation'],
  },
  {
    name: 'BA Sociology',
    description: 'Analyze social behavior, institutions, and the forces that shape society',
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Social Researcher', 'Community Organizer', 'Policy Analyst', 'NGO Worker'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Social analysis', 'Research', 'Critical thinking', 'Community engagement'],
  },
  {
    name: 'BA Political Science',
    description: 'Study government systems, political behavior, public policy, and international relations',
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Policy Analyst', 'Diplomat', 'Political Consultant', 'Public Servant'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Political analysis', 'Research', 'Communication', 'Strategic thinking'],
  },
  {
    name: 'BA Education',
    description: 'Prepare to teach and inspire learners across different educational levels',
    thinkingStyles: ['reflective', 'practical'],
    careerPaths: ['Teacher', 'Curriculum Developer', 'Educational Consultant', 'School Administrator'],
    universities: ['UP Diliman', 'DLSU Manila', 'PNU', 'UST'],
    skills: ['Pedagogical knowledge', 'Classroom management', 'Communication', 'Patience'],
  },

  // Balanced/hybrid programs
  {
    name: 'BS Medical Technology',
    description: 'Perform laboratory tests and analyses crucial for disease diagnosis and treatment',
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['Medical Technologist', 'Laboratory Manager', 'Research Technician', 'Quality Analyst'],
    universities: ['UST', 'UP Manila', 'FEU', 'Centro Escolar University'],
    skills: ['Laboratory skills', 'Analytical thinking', 'Attention to detail', 'Medical knowledge'],
  },
  {
    name: 'BS Biology',
    description: 'Study living organisms, ecosystems, genetics, and biological processes',
    thinkingStyles: ['analytical', 'reflective'],
    careerPaths: ['Biologist', 'Environmental Scientist', 'Research Scientist', 'Conservation Officer'],
    universities: ['UP Diliman', 'UST', 'Ateneo de Manila', 'DLSU Manila'],
    skills: ['Scientific research', 'Data analysis', 'Laboratory techniques', 'Environmental awareness'],
  },
  {
    name: 'BA Anthropology',
    description: 'Study human cultures, societies, evolution, and diversity across time and space',
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Anthropologist', 'Museum Curator', 'Cultural Consultant', 'Researcher'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'Silliman University', 'Xavier University'],
    skills: ['Cultural analysis', 'Research methods', 'Ethnography', 'Critical thinking'],
  },
  {
    name: 'BS Environmental Science',
    description: 'Address environmental challenges through science, policy, and sustainability practices',
    thinkingStyles: ['analytical', 'reflective', 'practical'],
    careerPaths: ['Environmental Scientist', 'Sustainability Consultant', 'Conservation Manager', 'Policy Analyst'],
    universities: ['UP Diliman', 'DLSU Manila', 'Ateneo de Manila', 'Silliman University'],
    skills: ['Environmental analysis', 'Sustainability', 'Research', 'Problem-solving'],
  },
];
