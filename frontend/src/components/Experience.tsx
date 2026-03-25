import { useTranslation } from '@/i18n';
import { Building2, Calendar, ChevronRight, ExternalLink } from 'lucide-react';

interface ExperienceItem {
  company: string;
  location: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  techstack: string;
  url?: string;
}

const experiences: ExperienceItem[] = [
  {
    company: 'Galaxy AI',
    location: 'Vietnam',
    role: 'System Architect & Founder',
    period: 'Mar 2013 - Present',
    url: 'https://galaxyai.net',
    description: 'Architect, Business Development Manager, Bridge Engineer, Project Manager, Project Delivery Specialist.',
    achievements: [
      'Coordinated with clients: Titan Groups, Kube, Rakuten Media, Yokogawa, Billgo, SmartCity Arcstone, and more',
      'Built MVP products for clients to present business ideas to investors',
      'Helped companies reduce cloud costs by 60-70% saving $50K-$200K/month',
      'Built and managed lean organizations of 2-50 people',
      'Helped clients migrate from legacy systems to cloud or hybrid solutions',
      'Maintained organizational compliance with IP, tangible, intangible, and future asset standards',
    ],
    techstack: 'Full-stack across .NET, Golang, Python, Cloud, AI/ML, Big Data, Microservices',
  },
  {
    company: 'eTreem',
    location: 'USA',
    role: 'Solution Architect',
    period: 'Sept 2022 - Dec 2025',
    description: 'Led the development of an enterprise-scale AI-powered payment processing system.',
    achievements: [
      'Architected multi-tenant SaaS platform for AI services using .NET Core & Python',
      'Designed PCI DSS-compliant payment processing infrastructure',
      'Implemented distributed CQRS architecture with Domain-Driven Design',
      'Reduced cloud infrastructure costs by 30% through optimized service patterns',
      'Designed multi-cloud architecture based on ArgoCD supporting AWS, Azure, and VPS',
      'Assisted clients migrating services from Azure to AWS',
    ],
    techstack: '.NET, Python, AI, Angular, Blazor, MSSQL, MongoDB, Redis, Elasticsearch, AWS, Azure, EKS, AKS, Terraform, ArgoCD',
  },
  {
    company: 'VinAI Research',
    location: 'Vietnam',
    role: 'Solution Architect & Lead Full-Stack',
    period: 'Sept 2021 - Mar 2023',
    description: 'Spearheaded development of enterprise IoT & access control systems.',
    achievements: [
      'Designed real-time IoT device management system supporting 100,000+ concurrent connections',
      'Architected custom OAuth2 service & license management system',
      'Led team of 30 developers across multiple projects',
      'Reduced deployment time by 60% through infrastructure as code',
      'Fine-tuned facial recognition with gRPC and QUIC protocols',
    ],
    techstack: '.NET, Golang, Python, AI, ReactJS, MySQL, MongoDB, Redis, Milvus, Elasticsearch, AWS, Azure, Terraform, ArgoCD',
  },
  {
    company: 'Mellowood Medical',
    location: 'Canada',
    role: 'Senior Full-Stack Engineer',
    period: 'Sept 2019 - Oct 2022',
    description: 'Led development of healthcare SaaS platform.',
    achievements: [
      'Implemented HIPAA-compliant video conferencing system supporting 50+ concurrent users',
      'Designed secure payment gateway integration',
      'Developed real-time data synchronization for medical records',
      'Reduced system response time by 50% through query optimization',
    ],
    techstack: '.NET, Golang, Python, ReactJS, MySQL, Blazor, MongoDB, Redis, Elasticsearch, Azure, AKS, WebRTC, Terraform',
  },
  {
    company: 'BeLive Technology',
    location: 'Singapore',
    role: 'Backend & Cloud Architect',
    period: 'Sept 2018 - Feb 2022',
    description: 'Led architecture & development of large-scale live streaming platform.',
    achievements: [
      'Designed microservices architecture handling 200,000 concurrent users',
      'Implemented AI-powered influencer ranking system',
      'Reduced infrastructure costs by 40% through optimized database scaling',
      'Delivered custom streaming solutions for Rakuten, Grab, Samsung',
      'Led team of 60 developers scaling from 10 to 60 in 2 years',
    ],
    techstack: '.NET, Golang, Python, ReactJS, MySQL, MongoDB, Redis, Elasticsearch, PyTorch, TensorFlow, AWS, Azure, Terraform',
  },
  {
    company: 'NeoGov',
    location: 'USA',
    role: 'Senior Full-Stack Engineer',
    period: 'Mar 2017 - Sept 2018',
    description: 'Developed & improved multi-tenant SaaS HR platform.',
    achievements: [
      'Built & published mobile apps using React Native, Swift, Kotlin',
      'Managed Azure cloud infrastructure ensuring 99.9% uptime',
      'Improved platform accessibility for distributed teams',
      'Led troubleshooting efforts for production issues',
    ],
    techstack: '.NET, Python, ReactJS, React Native, Kotlin, Swift, MSSQL, MongoDB, Redis, Elasticsearch, Azure, AKS, Terraform',
  },
  {
    company: 'As White Global',
    location: 'Vietnam, Australia',
    role: 'Full-Stack Engineer',
    period: 'Mar 2016 - Sept 2017',
    description: 'Developed & improved a multi-tenant SaaS insurance system.',
    achievements: [
      'Built the entire distributed system for insurance',
      'Developed automation system for QA team test case management',
    ],
    techstack: '.NET, Angular, MSSQL, Redis, Elasticsearch, OAuth2, WebSocket, GraphQL',
  },
  {
    company: 'Camino Information Service',
    location: 'USA',
    role: 'Full-Stack Engineer',
    period: 'Jan 2015 - Mar 2016',
    description: 'Developed & improved a multi-tenant SaaS platform for healthcare.',
    achievements: [
      'Built web application for SaaS healthcare management system',
      'Led troubleshooting and maintained code quality through unit testing',
    ],
    techstack: '.NET, Angular, Microservices, MSSQL, MongoDB, OAuth, WebSocket',
  },
  {
    company: 'Ebizworld',
    location: 'Vietnam',
    role: 'Junior Full-Stack Engineer',
    period: 'Jan 2014 - Jan 2015',
    description: 'Developed & improved a multi-tenant SaaS platform for gambling.',
    achievements: [
      'Built & published mobile apps for real-time betting using Swift, Kotlin, WebRTC',
      'Led troubleshooting efforts for production issues',
    ],
    techstack: '.NET, Angular, Python, Kotlin, Swift, MSSQL, MongoDB, Redis, OAuth, WebSocket',
  },
];

export function Experience() {
  const { t } = useTranslation();

  return (
    <section id="experience" className="py-20 bg-bg-alt" aria-labelledby="experience-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="experience-heading" className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">{t('experience.title')}</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line - hidden on mobile */}
          <div className="timeline-line hidden md:block" aria-hidden="true" />

          <div className="space-y-8 md:space-y-12">
            {experiences.map((exp, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={`${exp.company}-${exp.period}`}
                  className={`relative flex flex-col md:flex-row ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-start md:items-center gap-4 md:gap-8`}
                >
                  {/* Timeline dot */}
                  <div
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-bg-alt z-10"
                    aria-hidden="true"
                  />

                  {/* Mobile timeline dot */}
                  <div
                    className="md:hidden absolute left-[20px] w-3 h-3 rounded-full bg-primary z-10 top-6"
                    aria-hidden="true"
                  />

                  {/* Card */}
                  <div
                    className={`w-full md:w-[calc(50%-2rem)] ml-10 md:ml-0 ${
                      isLeft ? 'md:pr-4' : 'md:pl-4'
                    }`}
                  >
                    <div className="bg-surface rounded-2xl p-6 card-hover border border-border/30">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-text text-lg">{exp.role}</h3>
                          <p className="text-primary font-medium text-sm">
                            {exp.url ? (
                              <a
                                href={exp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                {exp.company}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              exp.company
                            )}
                            {' '}({exp.location})
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-text-dim text-xs mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{exp.period}</span>
                      </div>

                      {/* Description */}
                      <p className="text-text-muted text-sm mb-3">{exp.description}</p>

                      {/* Achievements */}
                      <ul className="space-y-1.5 mb-4">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start gap-2 text-text-dim text-xs">
                            <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech stack */}
                      <div className="pt-3 border-t border-border/30">
                        <p className="text-text-dim text-xs">
                          <span className="text-text-muted font-medium">{t('experience.tech')}: </span>
                          {exp.techstack}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for other side */}
                  <div className="hidden md:block w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
