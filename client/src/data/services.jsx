import {
  Building2, Code, Cloud, Shield, Bot, Headphones, Lightbulb,
} from 'lucide-react';

export const services = [
  {
    id: 'organization-setup',
    title: 'Organization Setup',
    shortDesc: 'Structured setup of your technology and processes so your organization can scale with clarity and control.',
    fullDesc: 'We help you establish a solid technology foundation from day one. From tooling and workflows to governance and team structure, we design an organization setup that aligns with your goals and grows with you.',
    icon: <Building2 className="w-8 h-8" />,
    features: [
      'Technology Stack Selection',
      'Process & Workflow Design',
      'Team Structure & Roles',
      'Governance & Policies',
      'Documentation & Knowledge Base'
    ],
    technologies: ['Notion', 'Slack', 'Jira', 'GitHub', 'Google Workspace'],
    process: [
      { title: 'Discovery', desc: 'Understanding your vision and constraints.' },
      { title: 'Design', desc: 'Proposing structure and tooling.' },
      { title: 'Implementation', desc: 'Rolling out processes and tools.' },
      { title: 'Handover', desc: 'Training and ongoing support.' }
    ]
  },
  {
    id: 'software-app-development',
    title: 'Software & App Development',
    shortDesc: 'Custom web and mobile applications built with modern stacks for performance, scale, and great user experience.',
    fullDesc: 'We build software that works. From responsive web apps to native and cross-platform mobile applications, we use proven technologies and agile practices to deliver on time and within budget.',
    icon: <Code className="w-8 h-8" />,
    features: [
      'Web Applications (SPA, PWA)',
      'Mobile Apps (iOS & Android)',
      'APIs & Integrations',
      'E-commerce & Portals',
      'Legacy Modernization'
    ],
    technologies: ['React', 'Next.js', 'Node.js', 'React Native', 'TypeScript'],
    process: [
      { title: 'Requirements', desc: 'Defining scope and priorities.' },
      { title: 'Design', desc: 'UX/UI and architecture.' },
      { title: 'Development', desc: 'Iterative, test-driven builds.' },
      { title: 'Launch', desc: 'Deploy and support.' }
    ]
  },
  {
    id: 'infrastructure-cloud',
    title: 'Infrastructure & Cloud',
    shortDesc: 'Reliable, scalable cloud infrastructure and DevOps practices so your systems stay secure and performant.',
    fullDesc: 'We design and manage cloud infrastructure that scales. Whether you are on AWS, Azure, or Google Cloud, we help you optimize costs, automate deployments, and maintain high availability.',
    icon: <Cloud className="w-8 h-8" />,
    features: [
      'Cloud Migration & Setup',
      'CI/CD Pipelines',
      'Infrastructure as Code',
      'Monitoring & Alerting',
      'Cost Optimization'
    ],
    technologies: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
    process: [
      { title: 'Assessment', desc: 'Current state and target architecture.' },
      { title: 'Design', desc: 'Infrastructure and automation plan.' },
      { title: 'Migration', desc: 'Phased rollout and cutover.' },
      { title: 'Operate', desc: 'Ongoing optimization and support.' }
    ]
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance',
    shortDesc: 'Protect your data and systems with security best practices and compliance frameworks tailored to your industry.',
    fullDesc: 'Security and compliance are built into our approach. We help you assess risks, implement controls, and prepare for audits so you can operate with confidence and meet regulatory requirements.',
    icon: <Shield className="w-8 h-8" />,
    features: [
      'Security Audits & Assessments',
      'Compliance (GDPR, SOC2, ISO)',
      'Access Control & IAM',
      'Incident Response',
      'Security Training'
    ],
    technologies: ['OWASP', 'Vault', 'SIEM', 'Pen Testing Tools'],
    process: [
      { title: 'Audit', desc: 'Identifying gaps and risks.' },
      { title: 'Remediation', desc: 'Implementing controls.' },
      { title: 'Documentation', desc: 'Policies and evidence.' },
      { title: 'Ongoing', desc: 'Monitoring and reviews.' }
    ]
  },
  {
    id: 'automation-ai',
    title: 'Automation & AI',
    shortDesc: 'Streamline operations and unlock insights with process automation and AI solutions tailored to your business.',
    fullDesc: 'We combine process automation and AI to reduce manual work and improve decisions. From RPA and workflow automation to custom ML models and integrations with LLMs, we deliver practical, measurable results.',
    icon: <Bot className="w-8 h-8" />,
    features: [
      'Process Automation (RPA)',
      'Workflow & Integration Automation',
      'AI/ML Models & Pipelines',
      'Chatbots & Virtual Assistants',
      'Data & Analytics Automation'
    ],
    technologies: ['Python', 'OpenAI', 'LangChain', 'n8n', 'Power Automate'],
    process: [
      { title: 'Discovery', desc: 'Identifying automation opportunities.' },
      { title: 'Design', desc: 'Solution and data flow design.' },
      { title: 'Build', desc: 'Development and testing.' },
      { title: 'Deploy', desc: 'Rollout and iteration.' }
    ]
  },
  {
    id: 'it-support-maintenance',
    title: 'IT Support & Maintenance',
    shortDesc: 'Proactive support and maintenance so your systems run smoothly and issues are resolved quickly.',
    fullDesc: 'We provide ongoing IT support and maintenance for the solutions we build and for existing systems. From helpdesk and monitoring to patches and upgrades, we keep your technology running reliably.',
    icon: <Headphones className="w-8 h-8" />,
    features: [
      'Helpdesk & Ticketing',
      'Monitoring & Alerts',
      'Updates & Patching',
      'Backup & Recovery',
      'Performance Tuning'
    ],
    technologies: ['Jira', 'PagerDuty', 'Datadog', 'GitHub Actions'],
    process: [
      { title: 'Onboarding', desc: 'Defining SLAs and access.' },
      { title: 'Run', desc: 'Day-to-day support and monitoring.' },
      { title: 'Improve', desc: 'Root cause and preventive actions.' },
      { title: 'Report', desc: 'Regular reviews and recommendations.' }
    ]
  },
  {
    id: 'consulting-strategy',
    title: 'Consulting & Strategy',
    shortDesc: 'Technology and digital strategy advice to align your roadmap with business goals and market opportunities.',
    fullDesc: 'We work with leadership and teams to shape technology and digital strategy. From due diligence and vendor selection to roadmap planning and digital transformation, we provide clear, actionable guidance.',
    icon: <Lightbulb className="w-8 h-8" />,
    features: [
      'Digital & Technology Strategy',
      'Vendor Selection & Due Diligence',
      'Roadmap & Prioritization',
      'Digital Transformation',
      'Training & Workshops'
    ],
    technologies: ['Strategy Frameworks', 'OKRs', 'Roadmapping Tools'],
    process: [
      { title: 'Understand', desc: 'Goals, context, and constraints.' },
      { title: 'Analyze', desc: 'Options and trade-offs.' },
      { title: 'Recommend', desc: 'Clear strategy and roadmap.' },
      { title: 'Support', desc: 'Execution support as needed.' }
    ]
  },
];
