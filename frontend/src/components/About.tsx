import { TrendingUp, Users, Rocket, DollarSign, Server, Cloud, Code, Database, Container, Brain, BarChart3, UserCheck } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getYearsOfExperience } from '@/utils/career';

const stats = [
  { icon: TrendingUp, value: getYearsOfExperience() + '+', labelKey: 'about.stats.experience' },
  { icon: Rocket, value: '5', labelKey: 'about.stats.startups' },
  { icon: Users, value: '60', labelKey: 'about.stats.team' },
  { icon: DollarSign, value: '60-70%', labelKey: 'about.stats.cost' },
];

const competencies = [
  {
    icon: Server,
    title: 'Architecture & Design',
    items: 'Microservices, Distributed Systems, CQRS, Event-Driven, DDD, Saga',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Cloud,
    title: 'Cloud Platforms',
    items: 'AWS, Azure, GCP, Vultr, Linode',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Code,
    title: 'Languages',
    items: 'C# .NET, Golang, Python, Rust, TypeScript',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Database,
    title: 'Databases',
    items: 'MSSQL, PostgreSQL, MongoDB, Redis, Elasticsearch, Vector DBs',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Container,
    title: 'DevOps',
    items: 'Kubernetes, Docker, Terraform, CI/CD, ArgoCD',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Brain,
    title: 'AI/ML',
    items: 'PyTorch, TensorFlow, Computer Vision, NLP, LLM, LangChain',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: BarChart3,
    title: 'Big Data',
    items: 'Kafka, Spark, Hadoop, Airflow, Databricks, Snowflake',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: UserCheck,
    title: 'Leadership',
    items: 'Cross-functional teams, Technical roadmap, Agile/Scrum',
    color: 'from-red-500 to-red-600',
  },
];

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20 bg-bg" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading with avatar */}
        <div className="text-center mb-16">
          <h2 id="about-heading" className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="gradient-text">{t('about.title')}</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-3xl mx-auto">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl p-[2px] bg-gradient-to-br from-primary to-accent">
                <img
                  src="/Avatar_01.jpg"
                  alt="Khoa Nguyen Dang"
                  className="w-full h-full rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="text-text-muted text-left leading-relaxed">
              {t('about.description')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.labelKey}
                className="bg-surface rounded-2xl p-6 text-center card-hover border border-border/30"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-text-muted text-sm">{t(stat.labelKey)}</div>
              </div>
            );
          })}
        </div>

        {/* Startup highlight */}
        <div className="mb-16 text-center">
          <p className="text-text-muted text-sm leading-relaxed">
            {t('about.startups.highlight')}
          </p>
        </div>

        {/* Competencies grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {competencies.map((comp) => {
            const Icon = comp.icon;
            return (
              <div
                key={comp.title}
                className="bg-surface rounded-2xl p-5 card-hover border border-border/30 group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${comp.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-text text-sm mb-2">{comp.title}</h3>
                <p className="text-text-dim text-xs leading-relaxed">{comp.items}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
