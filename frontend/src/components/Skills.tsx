import { useTranslation } from '@/i18n';

interface SkillCategory {
  name: string;
  color: string;
  bgColor: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Architecture',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    skills: [
      'Microservices', 'Distributed Systems', 'CQRS', 'Event-Driven', 'Domain-Driven',
      'Data-Driven', 'Cross Clustering', 'Peer To Peer', 'Hub-Spoke', 'Saga',
    ],
  },
  {
    name: 'Cloud',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    skills: ['AWS', 'Azure', 'GCP', 'Vultr', 'Linode', 'Hetzner', 'Openstack (Private cloud)'],
  },
  {
    name: 'Languages',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20',
    skills: ['C# .NET Core', 'Golang (Fiber/Gin/Echo)', 'Python (FastAPI/Django)', 'Rust (Actix/Axum)', 'NodeJS (Express)'],
  },
  {
    name: 'Frontend',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    skills: ['Angular', 'React', 'TypeScript', 'RxJS', 'NgRX', 'Redux', 'TailwindCSS', 'Ant Design', 'MaterialUI'],
  },
  {
    name: 'Databases',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    skills: ['MSSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Cassandra', 'Redis', 'Elasticsearch', 'Qdrant', 'Pinecone', 'Milvus'],
  },
  {
    name: 'DevOps',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'GitHub CI/CD', 'Azure DevOps', 'GitLab CI/CD', 'ArgoCD', 'Jenkins'],
  },
  {
    name: 'System',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    skills: [
      'Networking', 'Monitoring', 'Prometheus', 'Grafana', 'Datadog', 'OpenTelemetry', 'Kibana',
      'WebSocket', 'WebRTC', 'gRPC', 'HTTP2/3', 'QUIC', 'Kafka', 'RabbitMQ', 'MQTT', 'Istio', 'Signoz', 'Caddy', 'NATs', 'KEDA'
    ],
  },
  {
    name: 'Big Data',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    skills: [
      'Apache Kafka', 'Spark', 'Hadoop', 'Hive', 'HBase', 'Airflow', 'Azure Databricks',
      'Google BigQuery', 'Pub/Sub', 'PySpark', 'dbt', 'Snowflake', 'MLflow', 'Dagster',
    ],
  },
  {
    name: 'AI/ML',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    skills: [
      'PyTorch', 'TensorFlow', 'Computer Vision', 'NLP', 'LLM', 'LangChain', 'Deep Learning', 'Continual Learning', 'Reinforcement Learning', 
      'YOLO', 'Hugging Face', 'Explainable AI (xAI)', 'Feature Engineering', 'Fine-tuning', 'OCR', 'Time Series', 'RAGs', 'Agent to Agents', 'MCP',
    ],
  },
  {
    name: 'Compliance & Standards',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    skills: [
      'ISO 27001:2022', 'SOC 2', 'CCPA', 'GDPR', 'PDPA', 'HIPAA', 'PCI DSS',
      'OWASP', 'NIST CSF', 'OpenSSF', 'Data Privacy (PPI)', 'TOGAF 10',
    ],
  },
  {
    name: 'Leadership',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    skills: ['Cross-functional Teams', 'Technical Roadmap', 'Waterfall', 'Agile', 'Scrum', 'Mentoring'],
  },
];

export function Skills() {
  const { t } = useTranslation();

  return (
    <section id="skills" className="py-20 bg-bg-alt" aria-labelledby="skills-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="skills-heading" className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">{t('skills.title')}</span>
          </h2>
        </div>

        <div className="space-y-8">
          {skillCategories.map((category) => (
            <div key={category.name}>
              <h3 className={`text-lg font-semibold mb-3 ${category.color}`}>{category.name}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${category.bgColor} ${category.color} hover:scale-105 transition-transform cursor-default`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
