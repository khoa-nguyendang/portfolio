import { Award } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

const certifications: Certification[] = [
  { name: 'Deep Learning Specialization', issuer: 'Coursera - DeepLearning.ai', year: '2024' },
  { name: 'Machine Learning Specialization', issuer: 'Coursera - DeepLearning.ai', year: '2024' },
  { name: 'Mathematics for ML & Data Science', issuer: 'Coursera - DeepLearning.ai', year: '2024' },
  { name: 'AI Agents Using RAG and LangChain', issuer: 'Coursera - IBM', year: '2023' },
  { name: 'Unsupervised Learning, Recommenders, RL', issuer: 'Coursera - IBM', year: '2023' },
  { name: 'Data Science Professional', issuer: 'Coursera - IBM', year: '2022' },
  { name: 'Data Science Math Skills', issuer: 'Coursera - Duke University', year: '2022' },
  { name: 'Advanced CV, NLP, Audio & Timeseries', issuer: 'VNUHCM - University of Science', year: '2022' },
  { name: 'Data Modeling in Power BI', issuer: 'Coursera - Microsoft', year: '2021' },
  { name: 'Advanced Data Structures & Quantum Algorithms', issuer: 'Coursera - Univ. of Colorado Boulder', year: '2021' },
  { name: 'The Blockchain', issuer: 'Coursera - UC Irvine', year: '2020' },
  { name: 'AI Developer Professional Certificate', issuer: 'Coursera - IBM', year: '2020' },
  { name: 'AI Engineering Professional Certificate', issuer: 'Coursera - IBM', year: '2019' },
  { name: 'Advanced Cloud & Networking', issuer: 'VNUHCM - University of Science', year: '2018' },
  { name: 'Big Data with Spark & Hadoop', issuer: 'Coursera - IBM', year: '2018' },
  { name: 'Advanced C#, .NET, Golang, Angular, TSQL', issuer: 'Testdome', year: '2018' },
  { name: 'Multiple LinkedIn Badges (.NET, Golang, Python, AI, Cloud)', issuer: 'LinkedIn', year: '2017' },
];

const yearGroups = certifications.reduce<Record<string, Certification[]>>((acc, cert) => {
  if (!acc[cert.year]) acc[cert.year] = [];
  acc[cert.year].push(cert);
  return acc;
}, {});

const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

export function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certifications" className="py-20 bg-bg-alt" aria-labelledby="certifications-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="certifications-heading" className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">{t('certifications.title')}</span>
          </h2>
        </div>

        <div className="space-y-10">
          {sortedYears.map((year) => (
            <div key={year}>
              <h3 className="text-xl font-bold text-primary mb-4">{year}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearGroups[year].map((cert) => (
                  <div
                    key={cert.name}
                    className="bg-surface rounded-xl p-4 card-hover border border-border/30 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Award className="w-4.5 h-4.5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-text text-sm leading-tight mb-1">{cert.name}</h4>
                      <p className="text-text-dim text-xs">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
